/**
 * Changelog Widget
 *
 * Embeddable in-app release notes widget powered by SCOR Design System components.
 *
 * Usage:
 *   <script src="changelog-widget.js"></script>
 *   <changelog-widget></changelog-widget>
 *
 * Attributes:
 *   theme   - SDS theme name (default: "brms")
 *   app     - Application name shown in the drawer title (default: "BRMS")
 *
 * Future:
 *   api-url - URL of the Confluence API endpoint returning enriched release notes
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // SDS loader
  // ---------------------------------------------------------------------------

  const SDS_VERSION = "1.14.2";
  const SDS_CDN = "https://cdn.scor.com/sds/" + SDS_VERSION;

  function ensureSdsLoaded(theme) {
    if (!document.querySelector('link[href*="cdn.scor.com/sds"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = SDS_CDN + "/themes/" + theme + "/main.css";
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="cdn.scor.com/sds"]')) {
      var script = document.createElement("script");
      script.type = "module";
      script.src = SDS_CDN + "/loader.js";
      document.head.appendChild(script);
    }
  }

  // ---------------------------------------------------------------------------
  // Dummy release data (replace with Confluence API call)
  // ---------------------------------------------------------------------------

  var DUMMY_RELEASES = [
    {
      version: "4.53.0",
      date: "March 18, 2026",
      summary: [
        "Rules are now easier to test, debug, and maintain",
        "Outcome reasons now show actual medical condition details instead of technical codes",
        "Subset synchronisation is more reliable after push/pull operations",
      ],
      whatsNew: [
        {
          feature: "Test cases without assertions",
          description:
            "Save test scenarios with only inputs and add expected outcomes later. Useful for building up a test library gradually.",
          audience: ["Configurator"],
        },
        {
          feature: "Full decision tree via API",
          description:
            "The complete rule structure including node relations is now available for downstream analysis and AI Assistant integration.",
          audience: ["Admin", "Configurator"],
        },
        {
          feature: "Agent/distributor visibility setting",
          description:
            "Admins can now control whether agent contact details are shown to clients, directly from Admin > Settings.",
          audience: ["Admin"],
        },
      ],
      whatsImproved: [
        {
          improvement: "Reason descriptions now use actual answer titles",
          description:
            'e.g. "Decline due to hip surgery on left hip" instead of internal equivalence classes. Works across all languages and subsets.',
          audience: ["Underwriter", "Configurator"],
        },
        {
          improvement: "Debugger variables are grouped and sorted",
          description:
            "Internal and external variables are now organised by type (Flags, Evidences, Boolean, Date, etc.), making large rulesets easier to navigate.",
          audience: ["Configurator"],
        },
      ],
      fixes: [
        "Subset duplication to client namespaces no longer fails with inconsistent errors",
        'Subsets now correctly show "in sync" after successful push/pull operations',
        "Switching API variables in tests no longer causes a save error",
        "Claims workspace access is now properly restricted to users with claims permissions",
        '"Complete assessment" can no longer be accidentally triggered multiple times',
      ],
      actionRequired: [
        {
          who: "Configurators",
          what: "Remove the workaround for mapping equivalence classes back to answer IDs — the system now handles this natively.",
        },
        {
          who: "Admins",
          what: 'Review the new "Show agent/distributor contact details" setting under Admin > Settings > General if your clients should not see distributor information.',
        },
      ],
      audiences: ["Underwriter", "Configurator", "Admin", "Supervisor"],
      productAreas: ["BRMS"],
    },
    {
      version: "4.52.0",
      date: "March 4, 2026",
      summary: [
        "Claims workspace now supports multi-condition assessments",
        "Improved performance for large rulesets with 500+ variables",
        "New export options for test results",
      ],
      whatsNew: [
        {
          feature: "Multi-condition claims assessment",
          description:
            "Claims workspace now allows linking multiple conditions in a single assessment workflow, reducing manual steps.",
          audience: ["Underwriter", "Supervisor"],
        },
        {
          feature: "Test result export to Excel",
          description:
            "Download test run results as an Excel file for offline analysis and reporting.",
          audience: ["Configurator", "Admin"],
        },
      ],
      whatsImproved: [
        {
          improvement: "Ruleset load performance",
          description:
            "Loading large rulesets with 500+ variables is now up to 40% faster due to optimised variable resolution.",
          audience: ["Configurator"],
        },
      ],
      fixes: [
        "Fixed an issue where the portal would show stale data after a namespace switch",
        "Resolved timeout errors when generating large Excel exports",
        "Fixed date variable comparison edge case with leap year dates",
      ],
      actionRequired: [],
      audiences: ["Underwriter", "Configurator", "Admin", "Supervisor"],
      productAreas: ["BRMS", "Portal"],
    },
    {
      version: "4.51.0",
      date: "February 18, 2026",
      summary: [
        "New AI-assisted rule suggestion feature in preview",
        "Portal login flow streamlined with single sign-on improvements",
        "Better error messages throughout the application",
      ],
      whatsNew: [
        {
          feature: "AI rule suggestion (preview)",
          description:
            "The AI assistant can now suggest new rules based on your existing ruleset patterns. Available for opted-in namespaces.",
          audience: ["Configurator", "Admin"],
        },
      ],
      whatsImproved: [
        {
          improvement: "Single sign-on login flow",
          description:
            "Reduced the number of redirects during SSO login from 3 to 1, improving login speed significantly.",
          audience: ["Underwriter", "Supervisor", "Admin", "Configurator"],
        },
        {
          improvement: "Validation error messages",
          description:
            "Error messages across forms now use plain language and include actionable guidance.",
          audience: ["Underwriter", "Supervisor", "Admin", "Configurator"],
        },
      ],
      fixes: [
        "Fixed inconsistent pagination behaviour on the test cases list",
        "Resolved a display glitch in the rule tree when zooming in on Safari",
        'Fixed broken "copy link" action for shared rulesets',
      ],
      actionRequired: [],
      audiences: ["Underwriter", "Configurator", "Admin", "Supervisor"],
      productAreas: ["BRMS", "Portal"],
    },
  ];

  // ---------------------------------------------------------------------------
  // Rendering helpers
  // ---------------------------------------------------------------------------

  var AUDIENCE_VARIANTS = {
    Underwriter: "informative",
    Configurator: "highlight",
    Admin: "warning",
    Supervisor: "success",
  };

  function audienceBadge(audience) {
    var variant = AUDIENCE_VARIANTS[audience] || "default";
    return (
      '<sds-badge text="' +
      audience +
      '" variant="' +
      variant +
      '"></sds-badge>'
    );
  }

  function audienceBadges(audiences) {
    return audiences.map(audienceBadge).join(" ");
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSummary(summary) {
    if (!summary || typeof summary !== "string" || summary === "") return "";
    return (
      '<sds-content as="p" size="body" color="text-body" text="' +
      escapeHtml(summary) +
      '" style="line-height:var(--line-height-text);margin-bottom:var(--spacing-200)"></sds-content>'
    );
  }

  function renderNewItems(items) {
    return items
      .map(function (item) {
        return (
          '<div style="border-left:3px solid var(--border-brand);background:var(--background-secondary);border-radius:var(--radius-bold);padding:var(--spacing-300);display:flex;flex-direction:column;gap:var(--spacing-200)">' +
          '<div style="display:flex;align-items:center;gap:var(--spacing-200)">' +
          '<sds-content as="p" size="label" color="text-heading" text="' +
          escapeHtml(item.feature) +
          '" style="flex:1;min-width:0"></sds-content>' +
          '<div style="display:flex;gap:var(--spacing-100);flex-shrink:0">' +
          audienceBadges(item.audience) +
          "</div>" +
          "</div>" +
          '<sds-content as="p" size="meta" color="text-secondary" text="' +
          escapeHtml(item.description) +
          '"></sds-content>' +
          "</div>"
        );
      })
      .join("");
  }

  function renderImprovedItems(items) {
    return items
      .map(function (item) {
        return (
          '<div style="border-left:3px solid var(--border-default);background:var(--background-secondary);border-radius:var(--radius-bold);padding:var(--spacing-300);display:flex;flex-direction:column;gap:var(--spacing-200)">' +
          '<div style="display:flex;align-items:center;gap:var(--spacing-200)">' +
          '<sds-content as="p" size="label" color="text-heading" text="' +
          escapeHtml(item.improvement) +
          '" style="flex:1;min-width:0"></sds-content>' +
          '<div style="display:flex;gap:var(--spacing-100);flex-shrink:0">' +
          audienceBadges(item.audience) +
          "</div>" +
          "</div>" +
          '<sds-content as="p" size="meta" color="text-secondary" text="' +
          escapeHtml(item.description) +
          '"></sds-content>' +
          "</div>"
        );
      })
      .join("");
  }

  function renderFixes(fixes) {
    return fixes
      .map(function (fix) {
        return (
          '<sds-content as="p" size="body" color="text-body" text="• ' +
          escapeHtml(fix) +
          '"></sds-content>'
        );
      })
      .join("");
  }

  function renderUserImpact(impact) {
    if (!impact || Object.keys(impact).length === 0) return "";

    var html =
      '<sds-column gap="spacing-200">' +
      '<div style="border-top:2px solid var(--color-border-default);padding-top:var(--spacing-300);margin-bottom:var(--spacing-200)">' +
      '<sds-content as="p" size="label" color="text-heading" style="text-transform:uppercase;letter-spacing:1px;font-weight:600" text="User Impact"></sds-content>' +
      "</div>";

    Object.keys(impact).forEach(function (role) {
      var items = impact[role] || [];
      html +=
        '<div style="margin-top:var(--spacing-200)">' +
        '<sds-content as="p" size="label" color="text-heading" text="' +
        escapeHtml(role) +
        ':" style="margin-bottom:var(--spacing-100)"></sds-content>' +
        '<sds-column gap="spacing-100" style="margin-left:var(--spacing-300)">' +
        items
          .map(function (item) {
            return (
              '<sds-content as="p" size="body" color="text-body" text="• ' +
              escapeHtml(item) +
              '"></sds-content>'
            );
          })
          .join("") +
        "</sds-column>" +
        "</div>";
    });

    html += "</sds-column>";
    return html;
  }

  function renderActionRequired(items) {
    return items
      .map(function (item) {
        return (
          '<div style="background:var(--background-warning);border-radius:var(--radius-bold);padding:var(--spacing-300);display:flex;flex-direction:column;gap:var(--spacing-100)">' +
          '<sds-content as="p" size="label" color="text-heading" text="' +
          escapeHtml(item.who) +
          '"></sds-content>' +
          '<sds-content as="p" size="meta" color="text-body" text="' +
          escapeHtml(item.what) +
          '"></sds-content>' +
          "</div>"
        );
      })
      .join("");
  }

  function renderRelease(release, isFirst) {
    var sections = "";

    // What's New
    if (release.whatsNew.length > 0) {
      sections +=
        '<sds-column gap="spacing-300">' +
        '<div style="border-top:2px solid var(--color-border-default);padding-top:var(--spacing-300);margin-bottom:var(--spacing-200)">' +
        '<sds-content as="p" size="label" color="text-heading" style="text-transform:uppercase;letter-spacing:1px;font-weight:600" text="What\'s New"></sds-content>' +
        "</div>" +
        renderNewItems(release.whatsNew) +
        "</sds-column>";
    }

    // What's Improved
    if (release.whatsImproved.length > 0) {
      sections +=
        '<sds-column gap="spacing-300">' +
        '<div style="border-top:2px solid var(--color-border-default);padding-top:var(--spacing-300);margin-bottom:var(--spacing-200)">' +
        '<sds-content as="p" size="label" color="text-heading" style="text-transform:uppercase;letter-spacing:1px;font-weight:600" text="What\'s Improved"></sds-content>' +
        "</div>" +
        renderImprovedItems(release.whatsImproved) +
        "</sds-column>";
    }

    // Fixes
    if (release.fixes.length > 0) {
      sections +=
        '<sds-column gap="spacing-200">' +
        '<div style="border-top:2px solid var(--color-border-default);padding-top:var(--spacing-300);margin-bottom:var(--spacing-200)">' +
        '<sds-content as="p" size="label" color="text-heading" style="text-transform:uppercase;letter-spacing:1px;font-weight:600" text="Fixes"></sds-content>' +
        "</div>" +
        renderFixes(release.fixes) +
        "</sds-column>";
    }

    // User Impact
    if (release.userImpact && Object.keys(release.userImpact).length > 0) {
      var userImpactHtml = renderUserImpact(release.userImpact);
      if (userImpactHtml) {
        sections += userImpactHtml;
      }
    }

    // Action Required
    if (release.actionRequired.length > 0) {
      sections +=
        '<sds-column gap="spacing-200">' +
        '<div style="border-top:2px solid var(--color-border-default);padding-top:var(--spacing-300);margin-bottom:var(--spacing-200)">' +
        '<sds-content as="p" size="label" color="text-heading" style="text-transform:uppercase;letter-spacing:1px;font-weight:600" text="Action Required"></sds-content>' +
        "</div>" +
        renderActionRequired(release.actionRequired) +
        "</sds-column>";
    }

    return (
      '<sds-column gap="spacing-500" data-release="' +
      release.version +
      '">' +
      // Version header
      '<sds-row alignment="center" gap="spacing-300" justification="space-between">' +
      '<sds-row alignment="center" gap="spacing-200">' +
      '<sds-title size="h5" color="text-heading" text="v' +
      escapeHtml(release.version) +
      '"></sds-title>' +
      (isFirst
        ? '<sds-badge text="Latest" variant="highlight"></sds-badge>'
        : "") +
      "</sds-row>" +
      '<sds-content as="span" size="meta" color="text-secondary" text="' +
      escapeHtml(release.date) +
      '"></sds-content>' +
      "</sds-row>" +
      // Summary
      '<sds-column gap="spacing-200">' +
      renderSummary(release.summary) +
      "</sds-column>" +
      // Sections
      sections +
      // Source attribution
      '<sds-content as="p" size="meta" color="text-secondary" text="Source: Confluence" style="opacity:0.6"></sds-content>' +
      "</sds-column>"
    );
  }

  function renderReleases(releases) {
    return releases
      .map(function (release, index) {
        var html = renderRelease(release, index === 0);
        if (index < releases.length - 1) {
          html += '<sds-divider variant="solid"></sds-divider>';
        }
        return html;
      })
      .join("");
  }

  // ---------------------------------------------------------------------------
  // Custom element
  // ---------------------------------------------------------------------------

  class ChangelogWidget extends HTMLElement {
    constructor() {
      super();
      this._activeAudience = null;
    }

    connectedCallback() {
      const theme = this.getAttribute("theme") || "brms";
      this.style.display = "contents";
      ensureSdsLoaded(theme);

      const apiUrl = this.getAttribute("api-url");
      if (apiUrl) {
        this._fetchAndRender(apiUrl);
      } else {
        this._render(DUMMY_RELEASES);
      }
    }

    _fetchAndRender(apiUrl) {
      const self = this;
      this._render(DUMMY_RELEASES); // render placeholder immediately

      fetch(apiUrl, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok)
            throw new Error("Failed to load changelog (" + res.status + ")");
          return res.json();
        })
        .then(function (releases) {
          self._render(Array.isArray(releases) ? releases : DUMMY_RELEASES);
        })
        .catch(function () {
          self._render(DUMMY_RELEASES);
        });
    }

    _render(releases) {
      const releasesHtml = renderReleases(releases);

      this.innerHTML =
        "<sds-popout-drawer" +
        ' icon="bell"' +
        ' aria-label="What\'s new"' +
        ' badge="1"' +
        ' label="What\'s New"' +
        ' description="Latest releases and improvements"' +
        ' size="large"' +
        ' position="right"' +
        ' variant="tertiary"' +
        ">" +
        '<div style="display:flex;flex-direction:column;height:100%;overflow:hidden">' +
        '<sds-scrollable style="flex:1;overflow-y:auto">' +
        // Release list
        '<sds-column gap="spacing-600" padding="spacing-600/spacing-600/spacing-600/spacing-600" id="changelog-releases">' +
        releasesHtml +
        "</sds-column>" +
        "</sds-scrollable>" +
        "</div>" +
        "</sds-popout-drawer>";
    }
  }

  if (!customElements.get("changelog-widget")) {
    customElements.define("changelog-widget", ChangelogWidget);
  }
})();
