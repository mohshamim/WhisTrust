-- Reports filtering/sorting
create index if not exists idx_reports_org on reports(organization_id);
create index if not exists idx_reports_org_status on reports(organization_id, status);
create index if not exists idx_reports_org_created on reports(organization_id, created_at desc);
create index if not exists idx_reports_assigned on reports(organization_id, assigned_to);

-- Messages by report
create index if not exists idx_messages_report on messages(report_id, created_at);

-- Admin profiles by org
create index if not exists idx_admin_profiles_org on admin_profiles(organization_id);

-- Labels by report
create index if not exists idx_report_labels_report on report_labels(report_id);


