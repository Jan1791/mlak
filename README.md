# Maison Lydia AK

Boutique responsive Next.js pour Maison Lydia AK, avec collections, favoris, création de compte client, recherche visuelle locale, demandes assistées par WhatsApp et interfaces d'administration des produits et commandes.

## Démarrage

1. Installer Node.js et npm.
2. Installer les dépendances avec `npm install`.
3. Copier `.env.example` vers `.env.local` et renseigner l'URL Supabase, la clé publishable et le numéro WhatsApp.
4. Pour le projet Supabase déjà configuré pour Maison Lydia AK, exécuter la version actuelle de `supabase/migrations/202611230002_order_flow.sql` depuis le SQL Editor. Elle crée aussi `user_roles` si cette table manque. La migration `202611230001_init.sql` est le schéma de départ complet pour une nouvelle base vide; ne pas l'exécuter sur la base existante.
5. Démarrer l'application avec `npm run dev`.

Le catalogue Supabase actuel contient déjà huit produits actifs. La migration complémentaire ajoute les éléments nécessaires aux comptes clients et administrateurs, à la réception des demandes, à leur historique de statut, à la newsletter et aux photos produits. Les favoris et la comparaison visuelle d'images fonctionnent dans le navigateur; les photos de recherche ne sont pas envoyées. L'application conserve un catalogue de démonstration si Supabase n'est pas configuré. Les commandes ne sont confirmées qu'après vérification humaine par la boutique. Aucun paiement en ligne n'est annoncé comme actif.

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

Pour les comptes clients, activer le fournisseur e-mail dans Supabase Auth et ajouter `https://mlak.vercel.app/compte` aux URL de redirection autorisées. En développement, ajouter aussi `http://localhost:3000/compte`.

## Déploiement

Le projet est déployé sur Vercel à l'adresse `https://mlak.vercel.app`. Les variables Supabase et WhatsApp de `.env.example` doivent être définies dans les paramètres du projet Vercel. Les URL officielles des réseaux sont facultatives; sans elles, les icônes ouvrent la recherche de Maison Lydia AK sur chaque réseau. La clé publishable est prévue pour le navigateur; ne jamais ajouter une clé `service_role` ou une autre clé secrète à une variable `NEXT_PUBLIC_*`.

## Étapes prévues

- Boutique : accueil, collections, catalogue, détails, favoris, recherche visuelle, compte client, panier et commande assistée.
- Administration : connexion Supabase Auth, gestion des produits/photos et suivi des commandes.
- Évolutions : paramètres USD/CDF, gestion des fournisseurs, suivi des livraisons et notifications après validation des parcours correspondants.
