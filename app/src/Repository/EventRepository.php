<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Event;
use DateTimeInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Event>
 */
class EventRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Event::class);
    }

    /**
     * Fetch all events that could have an occurrence in [from, to].
     * Includes one-off events starting in range AND all recurring events
     * that started on or before $to (caller expands them).
     *
     * @return Event[]
     */
    public function findCandidatesForRange(DateTimeInterface $from, DateTimeInterface $to): array
    {
        return $this->createQueryBuilder('e')
            ->where(
                // One-off events in range
                '(e.recurrenceFrequency IS NULL AND e.startAt >= :from AND e.startAt <= :to)'
                . ' OR '
                // Recurring events that started before range end and haven't expired before range start
                . '(e.recurrenceFrequency IS NOT NULL AND e.startAt <= :to AND (e.recurrenceUntil IS NULL OR e.recurrenceUntil >= :fromDate))'
            )
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->setParameter('fromDate', $from)
            ->getQuery()
            ->getResult();
    }
}
