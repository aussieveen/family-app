<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\CustomShoppingItemRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CustomShoppingItemRepository::class)]
class CustomShoppingItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $category = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $quantity = null;

    #[ORM\Column]
    private DateTimeImmutable $createdAt;

    public function __construct(string $name)
    {
        $this->name      = $name;
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }
    public function getCategory(): ?string { return $this->category; }
    public function setCategory(?string $category): static { $this->category = $category; return $this; }
    public function getQuantity(): ?string { return $this->quantity; }
    public function setQuantity(?string $quantity): static { $this->quantity = $quantity; return $this; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
