<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\FamilyMember;
use App\Repository\FamilyMemberRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/members', format: 'json')]
#[OA\Tag(name: 'Family Members')]
class FamilyMemberController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FamilyMemberRepository $repository,
    ) {
    }

    #[Route('', name: 'api_members_list', methods: ['GET'])]
    #[OA\Get(summary: 'List all family members')]
    #[OA\Response(response: 200, description: 'List of family members')]
    public function list(): JsonResponse
    {
        return $this->json(
            array_map($this->formatMember(...), $this->repository->findAll())
        );
    }

    #[Route('', name: 'api_members_create', methods: ['POST'])]
    #[OA\Post(summary: 'Create a family member')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['name', 'avatarColour'],
            properties: [
                new OA\Property(property: 'name', type: 'string', example: 'Dad'),
                new OA\Property(property: 'avatarColour', type: 'string', example: '#3B82F6'),
            ]
        )
    )]
    #[OA\Response(response: 201, description: 'Created')]
    #[OA\Response(response: 400, description: 'Validation error')]
    public function create(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true) ?? [];

        if (empty($body['name']) || empty($body['avatarColour'])) {
            return $this->json(['error' => 'name and avatarColour are required'], Response::HTTP_BAD_REQUEST);
        }

        $member = new FamilyMember($body['name'], $body['avatarColour']);
        $this->em->persist($member);
        $this->em->flush();

        return $this->json($this->formatMember($member), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_members_update', methods: ['PUT'])]
    #[OA\Put(summary: 'Update a family member')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Updated')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function update(int $id, Request $request): JsonResponse
    {
        $member = $this->repository->find($id);

        if ($member === null) {
            return $this->json(['error' => 'Member not found'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true) ?? [];

        if (isset($body['name'])) {
            $member->setName($body['name']);
        }

        if (isset($body['avatarColour'])) {
            $member->setAvatarColour($body['avatarColour']);
        }

        $this->em->flush();

        return $this->json($this->formatMember($member));
    }

    #[Route('/{id}', name: 'api_members_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Delete a family member')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 204, description: 'Deleted')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function delete(int $id): JsonResponse
    {
        $member = $this->repository->find($id);

        if ($member === null) {
            return $this->json(['error' => 'Member not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($member);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function formatMember(FamilyMember $member): array
    {
        return [
            'id'           => $member->getId(),
            'name'         => $member->getName(),
            'avatarColour' => $member->getAvatarColour(),
            'createdAt'    => $member->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
