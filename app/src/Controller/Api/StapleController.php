<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Staple;
use App\Repository\StapleRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/staples', format: 'json')]
#[OA\Tag(name: 'Staples')]
class StapleController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly StapleRepository $repository,
    ) {
    }

    #[Route('', name: 'api_staples_list', methods: ['GET'])]
    #[OA\Get(summary: 'List all staples')]
    #[OA\Response(response: 200, description: 'Staple list')]
    public function list(): JsonResponse
    {
        return $this->json(array_map(
            $this->format(...),
            $this->repository->findBy([], ['name' => 'ASC'])
        ));
    }

    #[Route('', name: 'api_staples_create', methods: ['POST'])]
    #[OA\Post(summary: 'Create a staple')]
    #[OA\Response(response: 201, description: 'Created')]
    #[OA\Response(response: 400, description: 'Validation error')]
    public function create(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true) ?? [];

        if (empty($body['name'])) {
            return $this->json(['error' => 'name is required'], Response::HTTP_BAD_REQUEST);
        }

        $staple = new Staple(trim($body['name']));
        $staple->setCategory($body['category'] ?? null ?: null);
        $staple->setQuantity($body['quantity'] ?? null ?: null);

        $this->em->persist($staple);
        $this->em->flush();

        return $this->json($this->format($staple), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_staples_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Delete a staple')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 204, description: 'Deleted')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function delete(int $id): JsonResponse
    {
        $staple = $this->repository->find($id);

        if ($staple === null) {
            return $this->json(['error' => 'Staple not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($staple);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function format(Staple $staple): array
    {
        return [
            'id'       => $staple->getId(),
            'name'     => $staple->getName(),
            'category' => $staple->getCategory(),
            'quantity' => $staple->getQuantity(),
        ];
    }
}
