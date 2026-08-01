<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Participant
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Event::class, inversedBy: 'who')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Event $event;

    #[ORM\ManyToOne(targetEntity: FamilyMember::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private FamilyMember $member;

    public function __construct(Event $event, FamilyMember $member)
    {
        $this->event  = $event;
        $this->member = $member;
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
}
