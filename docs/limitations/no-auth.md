# No Authentication

## Summary

The app has no user accounts, no login screen, and no authentication layer on the backend API.
All API endpoints are open to any caller that can reach the host.

## Why

The app runs as a single always-on shared session on a wall-mounted tablet on a private home network.
Every family member shares the same view.
A login screen would add friction with no security benefit on a trusted LAN.

See [ADR-0002](../adr/0002-no-authentication.md) for the full decision record.

## Constraint

**Do not expose this app to the public internet or any untrusted network without first adding an authentication layer.**
The backend API will accept any request that reaches it.

## If Authentication Becomes Needed

Add an authentication layer (e.g. Symfony Security with a session or token) before changing the network exposure.
The frontend would need a login flow.
This is not a planned feature.

---

<details>
<summary>Source Map</summary>

- [ADR-0002](../adr/0002-no-authentication.md)

</details>

[← Limitations](README.md) | [← Documentation home](../README.md)
