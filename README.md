# Maison Lydia AK

Boutique responsive Next.js pour Maison Lydia AK, avec une première expérience d'achat, une demande de commande assistée par WhatsApp, une base Supabase sécurisée et une interface d'administration des produits et demandes reçues.

## Démarrage

1. Installer Node.js et npm.
2. Installer les dépendances avec `npm install`.
3. Copier `.env.example` vers `.env.local` et renseigner l'URL Supabase, la clé publishable et le numéro WhatsApp.
4. Pour le projet Supabase déjà configuré pour Maison Lydia AK, exécuter `supabase/migrations/202611230002_order_flow.sql` depuis le SQL Editor. La migration `202611230001_init.sql` est le schéma de départ complet pour une nouvelle base vide; ne pas l'exécuter sur la base existante.
5. Démarrer l'application avec `npm run dev`.

Le catalogue Supabase actuel contient déjà les tables de base et huit produits actifs. La migration complémentaire ajoute la réception des demandes de commande, leur historique de statut et l'inscription à la newsletter. L'application conserve un catalogue de démonstration si Supabase n'est pas configuré. Les commandes ne sont confirmées qu'après vérification humaine par la boutique. Aucun paiement en ligne n'est annoncé comme actif.

## Premier compte administrateur

Créer le compte de Lydia dans Supabase Auth, puis lui attribuer le rôle propriétaire dans le SQL Editor après avoir remplacé l'adresse :

```sql
insert into public.user_roles (user_id, role)
select id, 'owner'
from auth.users
where email = 'adresse-de-lydia@example.com'
on conflict (user_id) do update set role = excluded.role;
```

Les permissions et politiques RLS sont définies dans la migration. Les clés secrètes Supabase ne sont pas nécessaires au navigateur et ne doivent pas y être ajoutées.

## Déploiement

Le projet est déployé sur Vercel à l'adresse `https://mlak.vercel.app`. Les variables de `.env.example` doivent être définies dans les paramètres du projet Vercel. La clé publishable est prévue pour le navigateur; ne jamais ajouter une clé `service_role` ou une autre clé secrète à une variable `NEXT_PUBLIC_*`.

## Étapes prévues

- Boutique : accueil, catalogue, détail produit, panier et commande assistée.
- Administration : connexion Supabase Auth, produits et photos.
- Évolutions : paramètres USD/CDF, gestion des fournisseurs, livraison, notifications et comptes clients après validation des parcours correspondants.
