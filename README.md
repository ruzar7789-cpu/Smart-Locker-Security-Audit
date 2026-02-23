# Smart-Locker Security Audit Framework (SLSAF)

## Účel projektu
Tento repozitář slouží k dokumentaci a demonstraci kritických zranitelností v systémech automatizovaných výdejních boxů. Zaměřuje se na chyby v logice klientských aplikací a nezabezpečené Bluetooth/API protokoly.

### Klíčové oblasti testování:
1. **Frontend Price Manipulation:** Demonstrace selhání validace ceny na straně klienta (tzv. GhostStore bypass).
2. **Session Hijacking:** Analýza úniku tokenů v nezabezpečeném prostředí prohlížeče.
3. **Hardware Emulation:** Simulace otevíracích signálů pro solenoidové zámky.

> **UPOZORNĚNÍ:** Tento výzkum je určen výhradně pro etické účely a hlášení chyb výrobcům (Bug Bounty).
> 
