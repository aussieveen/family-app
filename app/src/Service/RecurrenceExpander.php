<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Event;
use DateTimeImmutable;
use DateTimeInterface;

/**
 * Expands recurring events into concrete occurrence dates within a range.
 */
class RecurrenceExpander
{
    /**
     * @param Event[] $candidates
     * @return array<int, array{event: Event, occurrenceDate: DateTimeImmutable}>
     */
    public function expand(array $candidates, DateTimeInterface $from, DateTimeInterface $to): array
    {
        $results = [];

        foreach ($candidates as $event) {
            if (!$event->isRecurring()) {
                $results[] = ['event' => $event, 'occurrenceDate' => DateTimeImmutable::createFromInterface($event->getStartAt())];
                continue;
            }

            foreach ($this->occurrences($event, $from, $to) as $date) {
                $results[] = ['event' => $event, 'occurrenceDate' => $date];
            }
        }

        usort($results, fn($a, $b) => $a['occurrenceDate'] <=> $b['occurrenceDate']);

        return $results;
    }

    /** @return DateTimeImmutable[] */
    private function occurrences(Event $event, DateTimeInterface $from, DateTimeInterface $to): array
    {
        $frequency = $event->getRecurrenceFrequency();
        $interval  = $event->getRecurrenceInterval();
        $days      = $event->getRecurrenceDaysOfWeek();
        $until     = $event->getRecurrenceUntil();
        $start     = DateTimeImmutable::createFromInterface($event->getStartAt());
        $rangeEnd  = min($to, $until ?? $to);

        $dates  = [];
        $cursor = $start;

        // ponytail: simple date iteration — max ~365 iterations for a year range, fast enough
        while ($cursor <= $rangeEnd) {
            if ($cursor >= $from && $this->matchesDay($cursor, $days)) {
                $dates[] = $cursor;
            }

            $cursor = match ($frequency) {
                'daily'   => $cursor->modify("+{$interval} day"),
                'weekly'  => $cursor->modify("+{$interval} week"),
                'monthly' => $cursor->modify("+{$interval} month"),
                default   => $rangeEnd->modify('+1 day'), // unknown frequency — stop
            };
        }

        return $dates;
    }

    private function matchesDay(DateTimeImmutable $date, ?array $days): bool
    {
        if ($days === null || $days === []) {
            return true;
        }

        return in_array(strtolower($date->format('l')), $days, true);
    }
}
