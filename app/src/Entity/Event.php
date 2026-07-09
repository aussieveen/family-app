<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EventRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EventRepository::class)]
#[ORM\Table(name: '`event`')]
class Event
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $title;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private \DateTimeInterface $startAt;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $endAt = null;

    #[ORM\Column]
    private bool $allDay = false;

    // Recurrence fields — null means one-off event
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $recurrenceFrequency = null; // daily | weekly | monthly

    #[ORM\Column]
    private int $recurrenceInterval = 1;

    /** @var list<string>|null */
    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $recurrenceDaysOfWeek = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $recurrenceUntil = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, Participant> */
    #[ORM\OneToMany(targetEntity: Participant::class, mappedBy: 'event', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $participants;

    /** @var Collection<int, Responsibility> */
    #[ORM\OneToMany(targetEntity: Responsibility::class, mappedBy: 'event', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $responsibilities;

    public function __construct(string $title, \DateTimeInterface $startAt)
    {
        $this->title          = $title;
        $this->startAt        = $startAt;
        $this->createdAt      = new \DateTimeImmutable();
        $this->participants   = new ArrayCollection();
        $this->responsibilities = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getStartAt(): \DateTimeInterface
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTimeInterface $startAt): static
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTimeInterface
    {
        return $this->endAt;
    }

    public function setEndAt(?\DateTimeInterface $endAt): static
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function isAllDay(): bool
    {
        return $this->allDay;
    }

    public function setAllDay(bool $allDay): static
    {
        $this->allDay = $allDay;

        return $this;
    }

    public function getRecurrenceFrequency(): ?string
    {
        return $this->recurrenceFrequency;
    }

    public function setRecurrenceFrequency(?string $recurrenceFrequency): static
    {
        $this->recurrenceFrequency = $recurrenceFrequency;

        return $this;
    }

    public function getRecurrenceInterval(): int
    {
        return $this->recurrenceInterval;
    }

    public function setRecurrenceInterval(int $recurrenceInterval): static
    {
        $this->recurrenceInterval = $recurrenceInterval;

        return $this;
    }

    public function getRecurrenceDaysOfWeek(): ?array
    {
        return $this->recurrenceDaysOfWeek;
    }

    public function setRecurrenceDaysOfWeek(?array $recurrenceDaysOfWeek): static
    {
        $this->recurrenceDaysOfWeek = $recurrenceDaysOfWeek;

        return $this;
    }

    public function getRecurrenceUntil(): ?\DateTimeInterface
    {
        return $this->recurrenceUntil;
    }

    public function setRecurrenceUntil(?\DateTimeInterface $recurrenceUntil): static
    {
        $this->recurrenceUntil = $recurrenceUntil;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function isRecurring(): bool
    {
        return $this->recurrenceFrequency !== null;
    }

    /** @return Collection<int, Participant> */
    public function getParticipants(): Collection
    {
        return $this->participants;
    }

    public function addParticipant(Participant $participant): static
    {
        if (!$this->participants->contains($participant)) {
            $this->participants->add($participant);
            $participant->setEvent($this);
        }

        return $this;
    }

    public function clearParticipants(): static
    {
        $this->participants->clear();

        return $this;
    }

    /** @return Collection<int, Responsibility> */
    public function getResponsibilities(): Collection
    {
        return $this->responsibilities;
    }

    public function addResponsibility(Responsibility $responsibility): static
    {
        if (!$this->responsibilities->contains($responsibility)) {
            $this->responsibilities->add($responsibility);
            $responsibility->setEvent($this);
        }

        return $this;
    }

    public function clearResponsibilities(): static
    {
        $this->responsibilities->clear();

        return $this;
    }
}
