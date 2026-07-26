<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\FamilyMemberRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: FamilyMemberRepository::class)]
#[ORM\HasLifecycleCallbacks]
class FamilyMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['member:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['member:read'])]
    private string $name;

    #[ORM\Column(length: 7)]
    #[Groups(['member:read'])]
    private string $avatarColour;

    #[ORM\Column]
    #[Groups(['member:read'])]
    private DateTimeImmutable $createdAt;

    public function __construct(string $name, string $avatarColour)
    {
        $this->name         = $name;
        $this->avatarColour = $avatarColour;
        $this->createdAt    = new DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getAvatarColour(): string
    {
        return $this->avatarColour;
    }

    public function setAvatarColour(string $avatarColour): static
    {
        $this->avatarColour = $avatarColour;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function initCreatedAt(): void
    {
        $this->createdAt ??= new DateTimeImmutable();
    }
}
