<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Responsibility
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Event::class, inversedBy: 'responsibilities')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Event $event;

    #[ORM\ManyToOne(targetEntity: FamilyMember::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private FamilyMember $member;

    #[ORM\Column(length: 100)]
    private string $label;

    public function __construct(Event $event, FamilyMember $member, string $label)
    {
        $this->event  = $event;
        $this->member = $member;
        $this->label  = $label;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEvent(): Event
    {
        return $this->event;
    }

    public function setEvent(Event $event): static
    {
        $this->event = $event;

        return $this;
    }

    public function getMember(): FamilyMember
    {
        return $this->member;
    }

    public function setMember(FamilyMember $member): static
    {
        $this->member = $member;

        return $this;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
