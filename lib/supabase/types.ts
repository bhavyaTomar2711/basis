import type { AuditInput, AuditResult } from "@/lib/audit/types";

/**
 * Hand-rolled Database type matching the schema in brain.md §8.1.
 * Conforms to Supabase's GenericSchema (Tables/Views/Functions, plus
 * Row/Insert/Update/Relationships per table).
 *
 * If the schema drifts, regenerate from the Supabase CLI:
 *   supabase gen types typescript --project-id <id> > lib/supabase/types.gen.ts
 */
export interface Database {
  public: {
    Tables: {
      audits: {
        Row: {
          id: string;
          slug: string;
          created_at: string;
          input: AuditInput;
          result: AuditResult;
          ai_summary: string | null;
          total_monthly_savings_usd: number;
          total_annual_savings_usd: number;
          user_agent: string | null;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          created_at?: string;
          input: AuditInput;
          result: AuditResult;
          ai_summary?: string | null;
          total_monthly_savings_usd: number;
          total_annual_savings_usd: number;
          user_agent?: string | null;
          ip_hash?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          created_at?: string;
          input?: AuditInput;
          result?: AuditResult;
          ai_summary?: string | null;
          total_monthly_savings_usd?: number;
          total_annual_savings_usd?: number;
          user_agent?: string | null;
          ip_hash?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          audit_id: string;
          email: string;
          company: string | null;
          role: string | null;
          team_size: number | null;
          created_at: string;
          email_sent_at: string | null;
          consultation_requested: boolean;
        };
        Insert: {
          id?: string;
          audit_id: string;
          email: string;
          company?: string | null;
          role?: string | null;
          team_size?: number | null;
          created_at?: string;
          email_sent_at?: string | null;
          consultation_requested?: boolean;
        };
        Update: {
          id?: string;
          audit_id?: string;
          email?: string;
          company?: string | null;
          role?: string | null;
          team_size?: number | null;
          created_at?: string;
          email_sent_at?: string | null;
          consultation_requested?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "leads_audit_id_fkey";
            columns: ["audit_id"];
            referencedRelation: "audits";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
