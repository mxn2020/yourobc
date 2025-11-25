/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as config_entityTypes from "../config/entityTypes.js";
import type * as config_features_index from "../config/features/index.js";
import type * as config_index from "../config/index.js";
import type * as config_system_entities_index from "../config/system/entities/index.js";
import type * as config_types from "../config/types.js";
import type * as config_yourobc from "../config/yourobc.js";
import type * as lib_config_config from "../lib/config/config.js";
import type * as lib_system_app_app_configs_constants from "../lib/system/app/app_configs/constants.js";
import type * as lib_system_app_app_configs_index from "../lib/system/app/app_configs/index.js";
import type * as lib_system_app_app_configs_mutations from "../lib/system/app/app_configs/mutations.js";
import type * as lib_system_app_app_configs_permissions from "../lib/system/app/app_configs/permissions.js";
import type * as lib_system_app_app_configs_queries from "../lib/system/app/app_configs/queries.js";
import type * as lib_system_app_app_configs_types from "../lib/system/app/app_configs/types.js";
import type * as lib_system_app_app_configs_utils from "../lib/system/app/app_configs/utils.js";
import type * as lib_system_app_app_settings_constants from "../lib/system/app/app_settings/constants.js";
import type * as lib_system_app_app_settings_index from "../lib/system/app/app_settings/index.js";
import type * as lib_system_app_app_settings_mutations from "../lib/system/app/app_settings/mutations.js";
import type * as lib_system_app_app_settings_permissions from "../lib/system/app/app_settings/permissions.js";
import type * as lib_system_app_app_settings_queries from "../lib/system/app/app_settings/queries.js";
import type * as lib_system_app_app_settings_types from "../lib/system/app/app_settings/types.js";
import type * as lib_system_app_app_settings_utils from "../lib/system/app/app_settings/utils.js";
import type * as lib_system_app_app_theme_settings_constants from "../lib/system/app/app_theme_settings/constants.js";
import type * as lib_system_app_app_theme_settings_index from "../lib/system/app/app_theme_settings/index.js";
import type * as lib_system_app_app_theme_settings_mutations from "../lib/system/app/app_theme_settings/mutations.js";
import type * as lib_system_app_app_theme_settings_permissions from "../lib/system/app/app_theme_settings/permissions.js";
import type * as lib_system_app_app_theme_settings_queries from "../lib/system/app/app_theme_settings/queries.js";
import type * as lib_system_app_app_theme_settings_types from "../lib/system/app/app_theme_settings/types.js";
import type * as lib_system_app_app_theme_settings_utils from "../lib/system/app/app_theme_settings/utils.js";
import type * as schema_base from "../schema/base.js";
import type * as schema_system_app_app_configs_app_configs from "../schema/system/app/app_configs/tables.js";
import type * as schema_system_app_app_configs_index from "../schema/system/app/app_configs/index.js";
import type * as schema_system_app_app_configs_schemas from "../schema/system/app/app_configs/schemas.js";
import type * as schema_system_app_app_configs_types from "../schema/system/app/app_configs/types.js";
import type * as schema_system_app_app_configs_validators from "../schema/system/app/app_configs/validators.js";
import type * as schema_system_app_app_settings_app_settings from "../schema/system/app/app_settings/tables.js";
import type * as schema_system_app_app_settings_index from "../schema/system/app/app_settings/index.js";
import type * as schema_system_app_app_settings_schemas from "../schema/system/app/app_settings/schemas.js";
import type * as schema_system_app_app_settings_types from "../schema/system/app/app_settings/types.js";
import type * as schema_system_app_app_settings_validators from "../schema/system/app/app_settings/validators.js";
import type * as schema_system_app_app_theme_settings_app_theme_settings from "../schema/system/app/app_theme_settings/tables.js";
import type * as schema_system_app_app_theme_settings_index from "../schema/system/app/app_theme_settings/index.js";
import type * as schema_system_app_app_theme_settings_schemas from "../schema/system/app/app_theme_settings/schemas.js";
import type * as schema_system_app_app_theme_settings_types from "../schema/system/app/app_theme_settings/types.js";
import type * as schema_system_app_app_theme_settings_validators from "../schema/system/app/app_theme_settings/validators.js";
import type * as schema_system_core_analytics_index from "../schema/system/core/analytics/index.js";
import type * as schema_system_core_analytics_schemas from "../schema/system/core/analytics/schemas.js";
import type * as schema_system_core_analytics_tables from "../schema/system/core/analytics/tables.js";
import type * as schema_system_core_analytics_types from "../schema/system/core/analytics/types.js";
import type * as schema_system_core_analytics_validators from "../schema/system/core/analytics/validators.js";
import type * as schema_system_core_audit_logs_index from "../schema/system/core/audit_logs/index.js";
import type * as schema_system_core_audit_logs_schemas from "../schema/system/core/audit_logs/schemas.js";
import type * as schema_system_core_audit_logs_tables from "../schema/system/core/audit_logs/tables.js";
import type * as schema_system_core_audit_logs_types from "../schema/system/core/audit_logs/types.js";
import type * as schema_system_core_audit_logs_validators from "../schema/system/core/audit_logs/validators.js";
import type * as schema_system_core_notifications_index from "../schema/system/core/notifications/index.js";
import type * as schema_system_core_notifications_schemas from "../schema/system/core/notifications/schemas.js";
import type * as schema_system_core_notifications_tables from "../schema/system/core/notifications/tables.js";
import type * as schema_system_core_notifications_types from "../schema/system/core/notifications/types.js";
import type * as schema_system_core_notifications_validators from "../schema/system/core/notifications/validators.js";
import type * as schema_system_core_permission_requests_index from "../schema/system/core/permission_requests/index.js";
import type * as schema_system_core_permission_requests_schemas from "../schema/system/core/permission_requests/schemas.js";
import type * as schema_system_core_permission_requests_tables from "../schema/system/core/permission_requests/tables.js";
import type * as schema_system_core_permission_requests_types from "../schema/system/core/permission_requests/types.js";
import type * as schema_system_core_permission_requests_validators from "../schema/system/core/permission_requests/validators.js";
import type * as schema_system_core_supporting_comments_index from "../schema/system/supporting/comments/index.js";
import type * as schema_system_core_supporting_comments_schemas from "../schema/system/supporting/comments/schemas.js";
import type * as schema_system_core_supporting_comments_tables from "../schema/system/supporting/comments/tables.js";
import type * as schema_system_core_supporting_comments_types from "../schema/system/supporting/comments/types.js";
import type * as schema_system_core_supporting_comments_validators from "../schema/system/supporting/comments/validators.js";
import type * as schema_system_core_supporting_counters_index from "../schema/system/supporting/counters/index.js";
import type * as schema_system_core_supporting_counters_schemas from "../schema/system/supporting/counters/schemas.js";
import type * as schema_system_core_supporting_counters_tables from "../schema/system/supporting/counters/tables.js";
import type * as schema_system_core_supporting_counters_types from "../schema/system/supporting/counters/types.js";
import type * as schema_system_core_supporting_counters_validators from "../schema/system/supporting/counters/validators.js";
import type * as schema_system_core_supporting_documents_index from "../schema/system/supporting/documents/index.js";
import type * as schema_system_core_supporting_documents_schemas from "../schema/system/supporting/documents/schemas.js";
import type * as schema_system_core_supporting_documents_tables from "../schema/system/supporting/documents/tables.js";
import type * as schema_system_core_supporting_documents_types from "../schema/system/supporting/documents/types.js";
import type * as schema_system_core_supporting_documents_validators from "../schema/system/supporting/documents/validators.js";
import type * as schema_system_core_supporting_exchange_rates_index from "../schema/system/supporting/exchange_rates/index.js";
import type * as schema_system_core_supporting_exchange_rates_schemas from "../schema/system/supporting/exchange_rates/schemas.js";
import type * as schema_system_core_supporting_exchange_rates_tables from "../schema/system/supporting/exchange_rates/tables.js";
import type * as schema_system_core_supporting_exchange_rates_types from "../schema/system/supporting/exchange_rates/types.js";
import type * as schema_system_core_supporting_exchange_rates_validators from "../schema/system/supporting/exchange_rates/validators.js";
import type * as schema_system_core_supporting_followup_reminders_index from "../schema/system/supporting/followup_reminders/index.js";
import type * as schema_system_core_supporting_followup_reminders_schemas from "../schema/system/supporting/followup_reminders/schemas.js";
import type * as schema_system_core_supporting_followup_reminders_tables from "../schema/system/supporting/followup_reminders/tables.js";
import type * as schema_system_core_supporting_followup_reminders_types from "../schema/system/supporting/followup_reminders/types.js";
import type * as schema_system_core_supporting_followup_reminders_validators from "../schema/system/supporting/followup_reminders/validators.js";
import type * as schema_system_core_supporting_index from "../schema/system/supporting/index.js";
import type * as schema_system_core_supporting_inquiry_sources_index from "../schema/system/supporting/inquiry_sources/index.js";
import type * as schema_system_core_supporting_inquiry_sources_schemas from "../schema/system/supporting/inquiry_sources/schemas.js";
import type * as schema_system_core_supporting_inquiry_sources_tables from "../schema/system/supporting/inquiry_sources/tables.js";
import type * as schema_system_core_supporting_inquiry_sources_types from "../schema/system/supporting/inquiry_sources/types.js";
import type * as schema_system_core_supporting_inquiry_sources_validators from "../schema/system/supporting/inquiry_sources/validators.js";
import type * as schema_system_core_supporting_notifications_index from "../schema/system/supporting/notifications/index.js";
import type * as schema_system_core_supporting_notifications_schemas from "../schema/system/supporting/notifications/schemas.js";
import type * as schema_system_core_supporting_notifications_tables from "../schema/system/supporting/notifications/tables.js";
import type * as schema_system_core_supporting_notifications_types from "../schema/system/supporting/notifications/types.js";
import type * as schema_system_core_supporting_notifications_validators from "../schema/system/supporting/notifications/validators.js";
import type * as schema_system_core_supporting_schemas from "../schema/system/supporting/schemas.js";
import type * as schema_system_core_supporting_wikiEntries_index from "../schema/system/supporting/wikiEntries/index.js";
import type * as schema_system_core_supporting_wikiEntries_schemas from "../schema/system/supporting/wikiEntries/schemas.js";
import type * as schema_system_core_supporting_wikiEntries_tables from "../schema/system/supporting/wikiEntries/tables.js";
import type * as schema_system_core_supporting_wikiEntries_types from "../schema/system/supporting/wikiEntries/types.js";
import type * as schema_system_core_supporting_wikiEntries_validators from "../schema/system/supporting/wikiEntries/validators.js";
import type * as schema_system_core_system_metrics_index from "../schema/system/core/system_metrics/index.js";
import type * as schema_system_core_system_metrics_schemas from "../schema/system/core/system_metrics/schemas.js";
import type * as schema_system_core_system_metrics_tables from "../schema/system/core/system_metrics/tables.js";
import type * as schema_system_core_system_metrics_types from "../schema/system/core/system_metrics/types.js";
import type * as schema_system_core_system_metrics_validators from "../schema/system/core/system_metrics/validators.js";
import type * as schema_system_dashboards_index from "../schema/system/dashboards/index.js";
import type * as schema_system_dashboards_schemas from "../schema/system/dashboards/schemas.js";
import type * as schema_system_dashboards_tables from "../schema/system/dashboards/tables.js";
import type * as schema_system_dashboards_types from "../schema/system/dashboards/types.js";
import type * as schema_system_dashboards_validators from "../schema/system/dashboards/validators.js";
import type * as schema_system_email_configs from "../schema/system/email/configs.js";
import type * as schema_system_email_configs_configs from "../schema/system/email/configs/tables.js";
import type * as schema_system_email_configs_index from "../schema/system/email/configs/index.js";
import type * as schema_system_email_configs_schemas from "../schema/system/email/configs/schemas.js";
import type * as schema_system_email_configs_types from "../schema/system/email/configs/types.js";
import type * as schema_system_email_configs_validators from "../schema/system/email/configs/validators.js";
import type * as schema_system_email_email_logs_index from "../schema/system/email/email_logs/index.js";
import type * as schema_system_email_email_logs_logs from "../schema/system/email/email_logs/tables.js";
import type * as schema_system_email_email_logs_schemas from "../schema/system/email/email_logs/schemas.js";
import type * as schema_system_email_email_logs_types from "../schema/system/email/email_logs/types.js";
import type * as schema_system_email_email_logs_validators from "../schema/system/email/email_logs/validators.js";
import type * as schema_system_email_email_templates_index from "../schema/system/email/email_templates/index.js";
import type * as schema_system_email_email_templates_schemas from "../schema/system/email/email_templates/schemas.js";
import type * as schema_system_email_email_templates_templates from "../schema/system/email/email_templates/tables.js";
import type * as schema_system_email_email_templates_types from "../schema/system/email/email_templates/types.js";
import type * as schema_system_email_email_templates_validators from "../schema/system/email/email_templates/validators.js";
import type * as schema_system_email_index from "../schema/system/email/index.js";
import type * as schema_system_email_logs from "../schema/system/email/logs.js";
import type * as schema_system_email_schemas from "../schema/system/email/schemas.js";
import type * as schema_system_email_templates from "../schema/system/email/templates.js";
import type * as schema_system_email_types from "../schema/system/email/types.js";
import type * as schema_system_email_validators from "../schema/system/email/validators.js";
import type * as schema_system_index from "../schema/system/index.js";
import type * as schema_system_schemas from "../schema/system/schemas.js";
import type * as schema_system_types from "../schema/system/types.js";
import type * as schema_system_validators from "../schema/system/validators.js";
import type * as shared_config_publicId from "../shared/config/publicId.js";
import type * as shared_errors from "../shared/errors.js";
import type * as shared_security_encryption from "../shared/security/encryption.js";
import type * as shared_security_envHelper from "../shared/security/envHelper.js";
import type * as shared_security_keyCache from "../shared/security/keyCache.js";
import type * as shared_security_rate_limiter from "../shared/security/rate_limiter.js";
import type * as shared_utils_helper from "../shared/utils/helper.js";
import type * as shared_utils_id_resolution from "../shared/utils/id_resolution.js";
import type * as shared_utils_publicId from "../shared/utils/publicId.js";
import type * as shared_validators from "../shared/validators.js";
import type * as test_authTest from "../test/authTest.js";
import type * as types from "../types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "config/entityTypes": typeof config_entityTypes;
  "config/features/index": typeof config_features_index;
  "config/index": typeof config_index;
  "config/system/entities/index": typeof config_system_entities_index;
  "config/types": typeof config_types;
  "config/yourobc": typeof config_yourobc;
  "lib/config/config": typeof lib_config_config;
  "lib/system/app/app_configs/constants": typeof lib_system_app_app_configs_constants;
  "lib/system/app/app_configs/index": typeof lib_system_app_app_configs_index;
  "lib/system/app/app_configs/mutations": typeof lib_system_app_app_configs_mutations;
  "lib/system/app/app_configs/permissions": typeof lib_system_app_app_configs_permissions;
  "lib/system/app/app_configs/queries": typeof lib_system_app_app_configs_queries;
  "lib/system/app/app_configs/types": typeof lib_system_app_app_configs_types;
  "lib/system/app/app_configs/utils": typeof lib_system_app_app_configs_utils;
  "lib/system/app/app_settings/constants": typeof lib_system_app_app_settings_constants;
  "lib/system/app/app_settings/index": typeof lib_system_app_app_settings_index;
  "lib/system/app/app_settings/mutations": typeof lib_system_app_app_settings_mutations;
  "lib/system/app/app_settings/permissions": typeof lib_system_app_app_settings_permissions;
  "lib/system/app/app_settings/queries": typeof lib_system_app_app_settings_queries;
  "lib/system/app/app_settings/types": typeof lib_system_app_app_settings_types;
  "lib/system/app/app_settings/utils": typeof lib_system_app_app_settings_utils;
  "lib/system/app/app_theme_settings/constants": typeof lib_system_app_app_theme_settings_constants;
  "lib/system/app/app_theme_settings/index": typeof lib_system_app_app_theme_settings_index;
  "lib/system/app/app_theme_settings/mutations": typeof lib_system_app_app_theme_settings_mutations;
  "lib/system/app/app_theme_settings/permissions": typeof lib_system_app_app_theme_settings_permissions;
  "lib/system/app/app_theme_settings/queries": typeof lib_system_app_app_theme_settings_queries;
  "lib/system/app/app_theme_settings/types": typeof lib_system_app_app_theme_settings_types;
  "lib/system/app/app_theme_settings/utils": typeof lib_system_app_app_theme_settings_utils;
  "schema/base": typeof schema_base;
  "schema/system/app/app_configs/app_configs": typeof schema_system_app_app_configs_app_configs;
  "schema/system/app/app_configs/index": typeof schema_system_app_app_configs_index;
  "schema/system/app/app_configs/schemas": typeof schema_system_app_app_configs_schemas;
  "schema/system/app/app_configs/types": typeof schema_system_app_app_configs_types;
  "schema/system/app/app_configs/validators": typeof schema_system_app_app_configs_validators;
  "schema/system/app/app_settings/app_settings": typeof schema_system_app_app_settings_app_settings;
  "schema/system/app/app_settings/index": typeof schema_system_app_app_settings_index;
  "schema/system/app/app_settings/schemas": typeof schema_system_app_app_settings_schemas;
  "schema/system/app/app_settings/types": typeof schema_system_app_app_settings_types;
  "schema/system/app/app_settings/validators": typeof schema_system_app_app_settings_validators;
  "schema/system/app/app_theme_settings/app_theme_settings": typeof schema_system_app_app_theme_settings_app_theme_settings;
  "schema/system/app/app_theme_settings/index": typeof schema_system_app_app_theme_settings_index;
  "schema/system/app/app_theme_settings/schemas": typeof schema_system_app_app_theme_settings_schemas;
  "schema/system/app/app_theme_settings/types": typeof schema_system_app_app_theme_settings_types;
  "schema/system/app/app_theme_settings/validators": typeof schema_system_app_app_theme_settings_validators;
  "schema/system/core/analytics/index": typeof schema_system_core_analytics_index;
  "schema/system/core/analytics/schemas": typeof schema_system_core_analytics_schemas;
  "schema/system/core/analytics/tables": typeof schema_system_core_analytics_tables;
  "schema/system/core/analytics/types": typeof schema_system_core_analytics_types;
  "schema/system/core/analytics/validators": typeof schema_system_core_analytics_validators;
  "schema/system/core/audit_logs/index": typeof schema_system_core_audit_logs_index;
  "schema/system/core/audit_logs/schemas": typeof schema_system_core_audit_logs_schemas;
  "schema/system/core/audit_logs/tables": typeof schema_system_core_audit_logs_tables;
  "schema/system/core/audit_logs/types": typeof schema_system_core_audit_logs_types;
  "schema/system/core/audit_logs/validators": typeof schema_system_core_audit_logs_validators;
  "schema/system/core/notifications/index": typeof schema_system_core_notifications_index;
  "schema/system/core/notifications/schemas": typeof schema_system_core_notifications_schemas;
  "schema/system/core/notifications/tables": typeof schema_system_core_notifications_tables;
  "schema/system/core/notifications/types": typeof schema_system_core_notifications_types;
  "schema/system/core/notifications/validators": typeof schema_system_core_notifications_validators;
  "schema/system/core/permission_requests/index": typeof schema_system_core_permission_requests_index;
  "schema/system/core/permission_requests/schemas": typeof schema_system_core_permission_requests_schemas;
  "schema/system/core/permission_requests/tables": typeof schema_system_core_permission_requests_tables;
  "schema/system/core/permission_requests/types": typeof schema_system_core_permission_requests_types;
  "schema/system/core/permission_requests/validators": typeof schema_system_core_permission_requests_validators;
  "schema/system/core/supporting/comments/index": typeof schema_system_core_supporting_comments_index;
  "schema/system/core/supporting/comments/schemas": typeof schema_system_core_supporting_comments_schemas;
  "schema/system/core/supporting/comments/tables": typeof schema_system_core_supporting_comments_tables;
  "schema/system/core/supporting/comments/types": typeof schema_system_core_supporting_comments_types;
  "schema/system/core/supporting/comments/validators": typeof schema_system_core_supporting_comments_validators;
  "schema/system/core/supporting/counters/index": typeof schema_system_core_supporting_counters_index;
  "schema/system/core/supporting/counters/schemas": typeof schema_system_core_supporting_counters_schemas;
  "schema/system/core/supporting/counters/tables": typeof schema_system_core_supporting_counters_tables;
  "schema/system/core/supporting/counters/types": typeof schema_system_core_supporting_counters_types;
  "schema/system/core/supporting/counters/validators": typeof schema_system_core_supporting_counters_validators;
  "schema/system/core/supporting/documents/index": typeof schema_system_core_supporting_documents_index;
  "schema/system/core/supporting/documents/schemas": typeof schema_system_core_supporting_documents_schemas;
  "schema/system/core/supporting/documents/tables": typeof schema_system_core_supporting_documents_tables;
  "schema/system/core/supporting/documents/types": typeof schema_system_core_supporting_documents_types;
  "schema/system/core/supporting/documents/validators": typeof schema_system_core_supporting_documents_validators;
  "schema/system/core/supporting/exchange_rates/index": typeof schema_system_core_supporting_exchange_rates_index;
  "schema/system/core/supporting/exchange_rates/schemas": typeof schema_system_core_supporting_exchange_rates_schemas;
  "schema/system/core/supporting/exchange_rates/tables": typeof schema_system_core_supporting_exchange_rates_tables;
  "schema/system/core/supporting/exchange_rates/types": typeof schema_system_core_supporting_exchange_rates_types;
  "schema/system/core/supporting/exchange_rates/validators": typeof schema_system_core_supporting_exchange_rates_validators;
  "schema/system/core/supporting/followup_reminders/index": typeof schema_system_core_supporting_followup_reminders_index;
  "schema/system/core/supporting/followup_reminders/schemas": typeof schema_system_core_supporting_followup_reminders_schemas;
  "schema/system/core/supporting/followup_reminders/tables": typeof schema_system_core_supporting_followup_reminders_tables;
  "schema/system/core/supporting/followup_reminders/types": typeof schema_system_core_supporting_followup_reminders_types;
  "schema/system/core/supporting/followup_reminders/validators": typeof schema_system_core_supporting_followup_reminders_validators;
  "schema/system/core/supporting/index": typeof schema_system_core_supporting_index;
  "schema/system/core/supporting/inquiry_sources/index": typeof schema_system_core_supporting_inquiry_sources_index;
  "schema/system/core/supporting/inquiry_sources/schemas": typeof schema_system_core_supporting_inquiry_sources_schemas;
  "schema/system/core/supporting/inquiry_sources/tables": typeof schema_system_core_supporting_inquiry_sources_tables;
  "schema/system/core/supporting/inquiry_sources/types": typeof schema_system_core_supporting_inquiry_sources_types;
  "schema/system/core/supporting/inquiry_sources/validators": typeof schema_system_core_supporting_inquiry_sources_validators;
  "schema/system/core/supporting/notifications/index": typeof schema_system_core_supporting_notifications_index;
  "schema/system/core/supporting/notifications/schemas": typeof schema_system_core_supporting_notifications_schemas;
  "schema/system/core/supporting/notifications/tables": typeof schema_system_core_supporting_notifications_tables;
  "schema/system/core/supporting/notifications/types": typeof schema_system_core_supporting_notifications_types;
  "schema/system/core/supporting/notifications/validators": typeof schema_system_core_supporting_notifications_validators;
  "schema/system/core/supporting/schemas": typeof schema_system_core_supporting_schemas;
  "schema/system/core/supporting/wikiEntries/index": typeof schema_system_core_supporting_wikiEntries_index;
  "schema/system/core/supporting/wikiEntries/schemas": typeof schema_system_core_supporting_wikiEntries_schemas;
  "schema/system/core/supporting/wikiEntries/tables": typeof schema_system_core_supporting_wikiEntries_tables;
  "schema/system/core/supporting/wikiEntries/types": typeof schema_system_core_supporting_wikiEntries_types;
  "schema/system/core/supporting/wikiEntries/validators": typeof schema_system_core_supporting_wikiEntries_validators;
  "schema/system/core/system_metrics/index": typeof schema_system_core_system_metrics_index;
  "schema/system/core/system_metrics/schemas": typeof schema_system_core_system_metrics_schemas;
  "schema/system/core/system_metrics/tables": typeof schema_system_core_system_metrics_tables;
  "schema/system/core/system_metrics/types": typeof schema_system_core_system_metrics_types;
  "schema/system/core/system_metrics/validators": typeof schema_system_core_system_metrics_validators;
  "schema/system/dashboards/index": typeof schema_system_dashboards_index;
  "schema/system/dashboards/schemas": typeof schema_system_dashboards_schemas;
  "schema/system/dashboards/tables": typeof schema_system_dashboards_tables;
  "schema/system/dashboards/types": typeof schema_system_dashboards_types;
  "schema/system/dashboards/validators": typeof schema_system_dashboards_validators;
  "schema/system/email/configs": typeof schema_system_email_configs;
  "schema/system/email/configs/configs": typeof schema_system_email_configs_configs;
  "schema/system/email/configs/index": typeof schema_system_email_configs_index;
  "schema/system/email/configs/schemas": typeof schema_system_email_configs_schemas;
  "schema/system/email/configs/types": typeof schema_system_email_configs_types;
  "schema/system/email/configs/validators": typeof schema_system_email_configs_validators;
  "schema/system/email/email_logs/index": typeof schema_system_email_email_logs_index;
  "schema/system/email/email_logs/logs": typeof schema_system_email_email_logs_logs;
  "schema/system/email/email_logs/schemas": typeof schema_system_email_email_logs_schemas;
  "schema/system/email/email_logs/types": typeof schema_system_email_email_logs_types;
  "schema/system/email/email_logs/validators": typeof schema_system_email_email_logs_validators;
  "schema/system/email/email_templates/index": typeof schema_system_email_email_templates_index;
  "schema/system/email/email_templates/schemas": typeof schema_system_email_email_templates_schemas;
  "schema/system/email/email_templates/templates": typeof schema_system_email_email_templates_templates;
  "schema/system/email/email_templates/types": typeof schema_system_email_email_templates_types;
  "schema/system/email/email_templates/validators": typeof schema_system_email_email_templates_validators;
  "schema/system/email/index": typeof schema_system_email_index;
  "schema/system/email/logs": typeof schema_system_email_logs;
  "schema/system/email/schemas": typeof schema_system_email_schemas;
  "schema/system/email/templates": typeof schema_system_email_templates;
  "schema/system/email/types": typeof schema_system_email_types;
  "schema/system/email/validators": typeof schema_system_email_validators;
  "schema/system/index": typeof schema_system_index;
  "schema/system/schemas": typeof schema_system_schemas;
  "schema/system/types": typeof schema_system_types;
  "schema/system/validators": typeof schema_system_validators;
  "shared/config/publicId": typeof shared_config_publicId;
  "shared/errors": typeof shared_errors;
  "shared/security/encryption": typeof shared_security_encryption;
  "shared/security/envHelper": typeof shared_security_envHelper;
  "shared/security/keyCache": typeof shared_security_keyCache;
  "shared/security/rate_limiter": typeof shared_security_rate_limiter;
  "shared/utils/helper": typeof shared_utils_helper;
  "shared/utils/id_resolution": typeof shared_utils_id_resolution;
  "shared/utils/publicId": typeof shared_utils_publicId;
  "shared/validators": typeof shared_validators;
  "test/authTest": typeof test_authTest;
  types: typeof types;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
