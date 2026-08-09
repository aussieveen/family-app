# Family Members

## Summary

Family Members are display profiles used throughout the app.
Each member has a name and an avatar colour.
There are no accounts or passwords.

## How It Works

Members are created and managed via the Sonata Admin interface (available at `/admin`) or the REST API.
The frontend fetches all members on startup and uses them to render avatars alongside Events.

### Member Shape (API response)

```json
{
  "id": 1,
  "name": "Dad",
  "avatarColour": "#3B82F6",
  "createdAt": "2026-07-01T00:00:00+00:00"
}
```

## Entry Points

- API route: `app/src/Controller/Api/FamilyMemberController.php`
- Sonata Admin: `app/src/Admin/FamilyMemberAdmin.php`
- Frontend API client: `frontend/src/api/familyApp.js` (`getMembers`, `createMember`)

## Dependencies

- Events reference Family Members via the `Participant` join entity.

---

<details>
<summary>Source Map</summary>

- [FamilyMemberController.php](../../app/src/Controller/Api/FamilyMemberController.php)
- [FamilyMember.php](../../app/src/Entity/FamilyMember.php)
- [FamilyMemberAdmin.php](../../app/src/Admin/FamilyMemberAdmin.php)
- [familyApp.js (members)](../../frontend/src/api/familyApp.js)

</details>

[← Features](README.md) | [← Documentation home](../README.md)
