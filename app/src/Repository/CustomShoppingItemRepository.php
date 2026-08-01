<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\CustomShoppingItem;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CustomShoppingItem>
 */
class CustomShoppingItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CustomShoppingItem::class);
    }
}
