<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260726000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop responsibility table; rename participants collection to who (no schema change needed)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS responsibility');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE TABLE responsibility (
            id INT AUTO_INCREMENT NOT NULL,
            event_id INT NOT NULL,
            member_id INT NOT NULL,
            label VARCHAR(100) NOT NULL,
            INDEX IDX_responsibility_event (event_id),
            INDEX IDX_responsibility_member (member_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_responsibility_event FOREIGN KEY (event_id) REFERENCES `event` (id) ON DELETE CASCADE,
            CONSTRAINT FK_responsibility_member FOREIGN KEY (member_id) REFERENCES family_member (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }
}
