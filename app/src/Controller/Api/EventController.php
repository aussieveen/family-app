<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Event;
use App\Entity\Participant;
use App\Repository\EventRepository;
use App\Repository\FamilyMemberRepository;
use App\Service\RecurrenceExpander;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/events', format: 'json')]
#[OA\Tag(name: 'Events')]
class EventController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly EventRepository $repository,
        private readonly FamilyMemberRepository $memberRepository,
        private readonly RecurrenceExpander $expander,
    ) {
    }

    #[Route('', name: 'api_events_list', methods: ['GET'])]
    #[OA\Get(summary: 'List events in a date range (recurring events are expanded)')]
    #[OA\Parameter(name: 'from', in: 'query', required: true, schema: new OA\Schema(type: 'string', example: '2026-07-07'))]
    #[OA\Parameter(name: 'to', in: 'query', required: true, schema: new OA\Schema(type: 'string', example: '2026-07-13'))]
    #[OA\Response(response: 200, description: 'Expanded event occurrences')]
    #[OA\Response(response: 400, description: 'Invalid date parameters')]
    public function list(Request $request): JsonResponse
    {
        $from = DateTimeImmutable::createFromFormat('Y-m-d', $request->query->getString('from'));
        $to   = DateTimeImmutable::createFromFormat('Y-m-d', $request->query->getString('to'));

        if ($from === false || $to === false) {
            return $this->json(['error' => 'from and to must be dates in YYYY-MM-DD format'], Response::HTTP_BAD_REQUEST);
        }

        $from = $from->setTime(0, 0);
        $to   = $to->setTime(23, 59, 59);

        $candidates  = $this->repository->findCandidatesForRange($from, $to);
        $occurrences = $this->expander->expand($candidates, $from, $to);

        return $this->json(array_map(
            fn($o) => $this->formatOccurrence($o['event'], $o['occurrenceDate']),
            $occurrences
        ));
    }

    #[Route('/{id}', name: 'api_events_get', methods: ['GET'])]
    #[OA\Get(summary: 'Get an event by ID')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Event')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function get(int $id): JsonResponse
    {
        $event = $this->repository->find($id);

        if ($event === null) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->formatEvent($event));
    }

    #[Route('', name: 'api_events_create', methods: ['POST'])]
    #[OA\Post(summary: 'Create an event')]
    #[OA\Response(response: 201, description: 'Created')]
    #[OA\Response(response: 400, description: 'Validation error')]
    public function create(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true) ?? [];

        [$error, $event] = $this->buildEvent($body);
        if ($error !== null) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($event);
        $this->em->flush();

        return $this->json($this->formatEvent($event), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_events_update', methods: ['PUT'])]
    #[OA\Put(summary: 'Update an event')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Updated')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function update(int $id, Request $request): JsonResponse
    {
        $event = $this->repository->find($id);

        if ($event === null) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true) ?? [];

        [$error, $updated] = $this->buildEvent($body, $event);
        if ($error !== null) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return $this->json($this->formatEvent($updated));
    }

    #[Route('/{id}', name: 'api_events_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Delete an event')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 204, description: 'Deleted')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function delete(int $id): JsonResponse
    {
        $event = $this->repository->find($id);

        if ($event === null) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($event);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** @return array{string|null, Event} */
    private function buildEvent(array $body, ?Event $event = null): array
    {
        if (empty($body['title'])) {
            return ['title is required', new Event('', new DateTimeImmutable())];
        }

        if (empty($body['startAt'])) {
            return ['startAt is required', new Event('', new DateTimeImmutable())];
        }

        $startAt = DateTimeImmutable::createFromFormat(\DateTimeInterface::ATOM, $body['startAt'])
            ?: DateTimeImmutable::createFromFormat('Y-m-d\TH:i:s', $body['startAt'])
            ?: DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $body['startAt'])
            ?: DateTimeImmutable::createFromFormat('Y-m-d', $body['startAt']);

        if ($startAt === false) {
            return ['startAt must be a valid ISO 8601 date', new Event('', new DateTimeImmutable())];
        }

        if ($event === null) {
            $event = new Event($body['title'], $startAt);
        } else {
            $event->setTitle($body['title']);
            $event->setStartAt($startAt);
        }

        $event->setAllDay((bool) ($body['allDay'] ?? false));

        if (!empty($body['endAt'])) {
            $endAt = DateTimeImmutable::createFromFormat(\DateTimeInterface::ATOM, $body['endAt'])
                ?: DateTimeImmutable::createFromFormat('Y-m-d\TH:i:s', $body['endAt'])
                ?: DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $body['endAt'])
                ?: DateTimeImmutable::createFromFormat('Y-m-d', $body['endAt']);
            $event->setEndAt($endAt ?: null);
        } else {
            $event->setEndAt(null);
        }

        // Recurrence
        $recurrence = $body['recurrence'] ?? null;
        if ($recurrence !== null) {
            $event->setRecurrenceFrequency($recurrence['frequency'] ?? null);
            $event->setRecurrenceInterval((int) ($recurrence['interval'] ?? 1));
            $event->setRecurrenceDaysOfWeek($recurrence['daysOfWeek'] ?? null);

            $until = isset($recurrence['until'])
                ? DateTimeImmutable::createFromFormat('Y-m-d', $recurrence['until'])
                : false;
            $event->setRecurrenceUntil($until ?: null);
        } else {
            $event->setRecurrenceFrequency(null);
            $event->setRecurrenceDaysOfWeek(null);
            $event->setRecurrenceUntil(null);
        }

        // Who — replace all
        $event->clearWho();
        foreach ($body['whoIds'] ?? [] as $memberId) {
            $member = $this->memberRepository->find((int) $memberId);
            if ($member !== null) {
                $event->addWho(new Participant($event, $member));
            }
        }

        return [null, $event];
    }

    private function formatOccurrence(Event $event, DateTimeImmutable $occurrenceDate): array
    {
        $data                  = $this->formatEvent($event);
        $data['occurrenceDate'] = $occurrenceDate->format('Y-m-d');

        return $data;
    }

    private function formatEvent(Event $event): array
    {
        return [
            'id'            => $event->getId(),
            'title'         => $event->getTitle(),
            'startAt'       => $event->getStartAt()->format(\DateTimeInterface::ATOM),
            'endAt'         => $event->getEndAt()?->format(\DateTimeInterface::ATOM),
            'allDay'        => $event->isAllDay(),
            'recurrence'    => $event->isRecurring() ? [
                'frequency'  => $event->getRecurrenceFrequency(),
                'interval'   => $event->getRecurrenceInterval(),
                'daysOfWeek' => $event->getRecurrenceDaysOfWeek(),
                'until'      => $event->getRecurrenceUntil()?->format('Y-m-d'),
            ] : null,
            'who'           => array_map(
                fn($p) => ['id' => $p->getMember()->getId(), 'name' => $p->getMember()->getName(), 'avatarColour' => $p->getMember()->getAvatarColour()],
                $event->getWho()->toArray()
            ),
            'createdAt'     => $event->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
