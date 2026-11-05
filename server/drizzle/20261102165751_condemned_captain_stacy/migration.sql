CREATE TABLE "email_tokens" (
	"id" text PRIMARY KEY,
	"purpose" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"fingerprint" text,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"email" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"successful" boolean NOT NULL,
	"suspicious" boolean DEFAULT false NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redirect_to" text
);
--> statement-breakpoint
CREATE TABLE "mfa_authenticators" (
	"user_id" text PRIMARY KEY,
	"secret" text NOT NULL,
	"confirmed" boolean NOT NULL,
	"pending_secret" text,
	"last_used_step" integer
);
--> statement-breakpoint
CREATE TABLE "mfa_failures" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mfa_failures_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"failed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_recovery_codes" (
	"user_id" text,
	"code_hash" text,
	CONSTRAINT "mfa_recovery_codes_pkey" PRIMARY KEY("user_id","code_hash")
);
--> statement-breakpoint
CREATE TABLE "oidc_logins" (
	"state" text PRIMARY KEY,
	"provider" text NOT NULL,
	"code_verifier" text NOT NULL,
	"nonce" text,
	"redirect_to" text,
	"link_user_id" text,
	"link_session_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" text PRIMARY KEY,
	"family_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"family_expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked" boolean DEFAULT false NOT NULL,
	"claims" jsonb
);
--> statement-breakpoint
CREATE TABLE "revoked_refresh_token_families" (
	"family_id" text PRIMARY KEY,
	"revoked_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" text,
	"permission_id" text,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL,
	"description" text NOT NULL,
	"system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_active_at" timestamp with time zone NOT NULL,
	"mfa" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text,
	"role_id" text,
	CONSTRAINT "user_roles_pkey" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"password_hash" text,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"failed_login_count" integer DEFAULT 0 NOT NULL,
	"last_failed_login_at" timestamp with time zone,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "email_tokens_user_id_purpose_idx" ON "email_tokens" ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "email_tokens_expires_at_idx" ON "email_tokens" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "identities_provider_subject_unique" ON "identities" ("provider","subject");--> statement-breakpoint
CREATE INDEX "identities_user_id_idx" ON "identities" ("user_id");--> statement-breakpoint
CREATE INDEX "login_history_user_time_idx" ON "login_history" ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "login_history_email_time_idx" ON "login_history" ("email","occurred_at");--> statement-breakpoint
CREATE INDEX "magic_links_expires_at_idx" ON "magic_links" ("expires_at");--> statement-breakpoint
CREATE INDEX "mfa_failures_user_id_failed_at_idx" ON "mfa_failures" ("user_id","failed_at");--> statement-breakpoint
CREATE INDEX "mfa_failures_failed_at_idx" ON "mfa_failures" ("failed_at");--> statement-breakpoint
CREATE INDEX "oidc_logins_expires_at_idx" ON "oidc_logins" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_unique" ON "permissions" ("key");--> statement-breakpoint
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens" ("family_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_family_expires_at_idx" ON "refresh_tokens" ("family_expires_at");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_key_unique" ON "roles" ("key");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" ("status");--> statement-breakpoint
ALTER TABLE "email_tokens" ADD CONSTRAINT "email_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "identities" ADD CONSTRAINT "identities_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "mfa_authenticators" ADD CONSTRAINT "mfa_authenticators_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mfa_failures" ADD CONSTRAINT "mfa_failures_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mfa_recovery_codes" ADD CONSTRAINT "mfa_recovery_codes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;