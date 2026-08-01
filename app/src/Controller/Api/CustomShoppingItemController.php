<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\CustomShoppingItem;
use App\Repository\CustomShoppingItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/custom-shopping-items', format: 'json')]
#[OA\Tag(name: 'Custom Shopping Items')]
class CustomShoppingItemController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly CustomShoppingItemRepository $repository,
    ) {
    }

    #[Route('', name: 'api_custom_shopping_items_list', methods: ['GET'])]
    #[OA\Get(summary: 'List all persisted custom shopping items')]
    #[OA\Response(response: 200, description: 'Custom item list')]
    public function list(): JsonResponse
    {
        return $this->json(array_map(
            $this->format(...),
            $this->repository->findBy([], ['createdAt' => 'ASC'])
        ));
    }

    #[Route('', name: 'api_custom_shopping_items_create', methods: ['POST'])]
    #[OA\Post(summary: 'Add a custom shopping item')]
    #[OA\Response(response: 201, description: 'Created')]
    #[OA\Response(response: 400, description: 'Validation error')]
    public function create(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true) ?? [];

        if (empty($body['name'])) {
            return $this->json(['error' => 'name is required'], Response::HTTP_BAD_REQUEST);
        }

        $item = new CustomShoppingItem(trim($body['name']));
        $item->setCategory($body['category'] ?? null ?: null);
        $item->setQuantity($body['quantity'] ?? null ?: null);

        $this->em->persist($item);
        $this->em->flush();

        return $this->json($this->format($item), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_custom_shopping_items_update', methods: ['PATCH'])]
    #[OA\Patch(summary: 'Update a custom shopping item')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Updated')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function update(int $id, Request $request): JsonResponse
    {
        $item = $this->repository->find($id);

        if ($item === null) {
            return $this->json(['error' => 'Item not found'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true) ?? [];

        if (array_key_exists('name', $body)) $item->setName(trim($body['name']));
        if (array_key_exists('quantity', $body)) $item->setQuantity($body['quantity'] ?: null);
        if (array_key_exists('category', $body)) $item->setCategory($body['category'] ?: null);

        $this->em->flush();

        return $this->json($this->format($item));
    }

    #[Route('/{id}', name: 'api_custom_shopping_items_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Remove a custom shopping item')]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 204, description: 'Deleted')]
    #[OA\Response(response: 404, description: 'Not found')]
    public function delete(int $id): JsonResponse
    {
        $item = $this->repository->find($id);

        if ($item === null) {
            return $this->json(['error' => 'Item not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($item);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('', name: 'api_custom_shopping_items_clear', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Clear all custom shopping items (called on done shopping)')]
    #[OA\Response(response: 204, description: 'Cleared')]
    public function clear(): JsonResponse
    {
        $this->repository->createQueryBuilder('c')->delete()->getQuery()->execute();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function format(CustomShoppingItem $item): array
    {
        return [
            'id'       => $item->getId(),
            'name'     => $item->getName(),
            'category' => $item->getCategory(),
            'quantity' => $item->getQuantity(),
        ];
    }
}
