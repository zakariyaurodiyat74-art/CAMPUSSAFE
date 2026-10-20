/* =========================================================
   CAMPUSSAFE - DASHBOARD SCRIPT (complete & fixed)
   ========================================================= */

const DASHBOARD_ACCOUNTS_KEY = "campusAccounts";
const DASHBOARD_REPORTS_KEY = "campusReports";
const DASHBOARD_CURRENT_USER_KEY = "currentUserEmail";

function getAccounts() {
    try {
        const accounts = JSON.parse(localStorage.getItem(DASHBOARD_ACCOUNTS_KEY));
        return Array.isArray(accounts) ? accounts : [];
    } catch (e) { return []; }
}
function saveAccounts(accounts) {
    localStorage.setItem(DASHBOARD_ACCOUNTS_KEY, JSON.stringify(accounts));
}
function getReports() {
    try {
        const reports = JSON.parse(localStorage.getItem(DASHBOARD_REPORTS_KEY));
        return Array.isArray(reports) ? reports : [];
    } catch (e) { return []; }
}
function saveReports(reports) {
    localStorage.setItem(DASHBOARD_REPORTS_KEY, JSON.stringify(reports));
}

const currentUserEmail = localStorage.getItem(DASHBOARD_CURRENT_USER_KEY);
let accounts = getAccounts();
let currentUser = accounts.find(a =>
    String(a.email || "").toLowerCase() === String(currentUserEmail || "").toLowerCase()
);
if (!currentUser) {
    window.location.href = "login.html";
}

function escapeHTML(v) {
    if (v == null) return "";
    return String(v)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function getFullName(u) {
    return `${u.firstName || ""} ${u.lastName || ""}`.trim();
}
function getInitials(u) {
    return ((u.firstName || "").charAt(0) + (u.lastName || "").charAt(0)).toUpperCase() || "U";
}
function formatRole(role) {
    const map = {
        student: "Student", academicStaff: "Academic Staff",
        nonAcademicStaff: "Non-Academic Staff", security: "Security Personnel", visitor: "Visitor"
    };
    return map[role] || role || "User";
}
function formatDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    return isNaN(date) ? escapeHTML(d) : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function capitalize(v) { return v ? v.charAt(0).toUpperCase() + v.slice(1) : ""; }


function canCurrentUserMonitor() {
    if (!currentUser) {
        return false;
    }

    const role = String(currentUser.role || "")
        .trim()
        .toLowerCase();

    const position = String(currentUser.academicPosition || "")
        .trim()
        .toLowerCase();

    // Security Officers are authorized.
    if (role === "security") {
        return true;
    }

    // Only Professors in Academic Staff are authorized.
    if (role === "academicstaff" && position === "professor") {
        return true;
    }

    return false;
}

function isReportOwnedByCurrentUser(report) {
    return report && currentUser &&
        String(report.reporterEmail || "").toLowerCase() === String(currentUser.email || "").toLowerCase();
}


const sidebarLinks = document.querySelectorAll(
    ".sidebar-menu a[data-section]"
);

const dashboardSections = {
    dashboard: document.getElementById("dashboard"),
    report: document.getElementById("report"),
    myReports: document.getElementById("myReports"),
    monitoring: document.getElementById("monitoring"),
    profile: document.getElementById("profile")
};


function showSection(name) {

    const targetSection = dashboardSections[name];

    if (!targetSection) {
        console.error("Section not found:", name);
        return;
    }

    // Block unauthorized Monitoring access.
    if (
        name === "monitoring" &&
        !canCurrentUserMonitor()
    ) {
        alert("Access denied. You are not authorized to view security monitoring.");
        return;
    }

    // Hide every section and remove its active class.
    Object.values(dashboardSections).forEach(section => {
        if (section) {
            section.classList.remove("active-page");
            section.style.display = "none";
        }
    });

    // Show only the selected section.
    targetSection.classList.add("active-page");
    targetSection.style.display = "block";

    // Update the sidebar highlight.
    sidebarLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === name
        );
    });

    // Refresh section content.
    if (name === "dashboard") {
        displayStatistics();
        displayRecentReports();
    }

    if (name === "myReports") {
        displayMyReports();
    }

    if (name === "monitoring") {
        displayMonitoringReports();
    }

    if (name === "profile") {
        displayProfile();
    }

    // Return to the top of the selected section.
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Sidebar navigation.
sidebarLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        showSection(this.dataset.section);
    });
});

// Links and buttons that navigate between sections.
document.querySelectorAll("[data-section-link]").forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        showSection(this.dataset.sectionLink);
    });
});

function updateMonitoringAccess() {
    const link = document.getElementById("monitoringNavLink");
    if (link) link.style.display = canCurrentUserMonitor() ? "flex" : "none";
}

function displayUserInfo() {
    if (!currentUser) return;
    const full = getFullName(currentUser);
    const role = formatRole(currentUser.role);
   const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("loggedUser", full || "User");
    set("loggedRole", role);
    set("userAvatar", getInitials(currentUser));
    set("welcomeUser", currentUser.firstName || "User");
}

function getDepartmentOrUnit(u) {
    if (!u) return "—";
    if (u.role === "student") return u.department || "—";
    if (u.role === "academicStaff") return u.academicDepartment || "—";
    if (u.role === "nonAcademicStaff") return u.staffUnit || "—";
    if (u.role === "security") return u.securityUnit || "—";
    if (u.role === "visitor") return u.organization || "—";
    return "—";
}
function getIdentification(u) {
    if (!u) return "—";
    if (u.role === "student") return u.matricNumber || "—";
    if (u.role === "academicStaff") return u.academicStaffId || "—";
    if (u.role === "nonAcademicStaff") return u.nonAcademicStaffId || "—";
    if (u.role === "security") return u.securityId || "—";
    if (u.role === "visitor") return "Visitor";
    return "—";
}
function getLevelOrPosition(u) {
    if (!u) return "—";
    if (u.role === "student") return u.level || "—";
    if (u.role === "academicStaff") return u.academicPosition || "—";
    if (u.role === "nonAcademicStaff") return u.staffPosition || "—";
    if (u.role === "security") return u.securityPost || "—";
    if (u.role === "visitor") return u.visitPurpose || "—";
    return "—";
}

function displayProfile() {
    if (!currentUser) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("profileAvatar", getInitials(currentUser));
    set("profileName", getFullName(currentUser) || "User");
    set("profileEmail", currentUser.email || "—");
    set("profilePhone", currentUser.phone || "—");
    set("profileRole", formatRole(currentUser.role));
    set("profileDepartment", getDepartmentOrUnit(currentUser));
    set("profileIdentification", getIdentification(currentUser));
    set("profileLevel", getLevelOrPosition(currentUser));
}
const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileSection = document.getElementById("editProfileSection");
const editProfileForm = document.getElementById("editProfileForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");

function renderEditRoleFields(role) {
    const container = document.getElementById("editRoleFields");
    if (!container) return;
    if (!role) { container.innerHTML = ""; return; }
    let html = "";
    if (role === "student") {
        html = `<div class="role-fields"><div class="role-fields-header"><h4>Student Information</h4><p>Update your academic details.</p></div>
        <div class="form-row"><div class="form-group"><label>Faculty</label><input type="text" id="editFaculty" value="${escapeHTML(currentUser.faculty || "")}"></div>
        <div class="form-group"><label>Department</label><input type="text" id="editDepartment" value="${escapeHTML(currentUser.department || "")}"></div></div>
        <div class="form-row"><div class="form-group"><label>Matriculation Number</label><input type="text" id="editMatricNumber" value="${escapeHTML(currentUser.matricNumber || "")}"></div>
        <div class="form-group"><label>Level</label><input type="text" id="editLevel" value="${escapeHTML(currentUser.level || "")}"></div></div></div>`;
    } else if (role === "academicStaff") {
        html = `<div class="role-fields"><div class="role-fields-header"><h4>Academic Staff Information</h4><p>Update your staff details.</p></div>
        <div class="form-row"><div class="form-group"><label>Faculty</label><input type="text" id="editAcademicFaculty" value="${escapeHTML(currentUser.academicFaculty || "")}"></div>
        <div class="form-group"><label>Department</label><input type="text" id="editAcademicDepartment" value="${escapeHTML(currentUser.academicDepartment || "")}"></div></div>
        <div class="form-row"><div class="form-group"><label>Staff ID</label><input type="text" id="editAcademicStaffId" value="${escapeHTML(currentUser.academicStaffId || "")}"></div>
        <div class="form-group"><label>Position</label><input type="text" id="editAcademicPosition" value="${escapeHTML(currentUser.academicPosition || "")}"></div></div></div>`;
    } else if (role === "nonAcademicStaff") {
        html = `<div class="role-fields"><div class="role-fields-header"><h4>Non-Academic Staff Information</h4><p>Update your staff details.</p></div>
        <div class="form-row"><div class="form-group"><label>Unit / Office</label><input type="text" id="editStaffUnit" value="${escapeHTML(currentUser.staffUnit || "")}"></div>
        <div class="form-group"><label>Staff ID</label><input type="text" id="editNonAcademicStaffId" value="${escapeHTML(currentUser.nonAcademicStaffId || "")}"></div></div>
        <div class="form-group"><label>Position</label><input type="text" id="editStaffPosition" value="${escapeHTML(currentUser.staffPosition || "")}"></div></div>`;
    } else if (role === "security") {
        html = `<div class="role-fields"><div class="role-fields-header"><h4>Security Personnel Information</h4><p>Update your security assignment details.</p></div>
        <div class="form-row"><div class="form-group"><label>Security ID</label><input type="text" id="editSecurityId" value="${escapeHTML(currentUser.securityId || "")}"></div>
        <div class="form-group"><label>Unit / Command</label><input type="text" id="editSecurityUnit" value="${escapeHTML(currentUser.securityUnit || "")}"></div></div>
        <div class="form-group"><label>Post / Assignment</label><input type="text" id="editSecurityPost" value="${escapeHTML(currentUser.securityPost || "")}"></div></div>`;
    } else if (role === "visitor") {
        html = `<div class="role-fields"><div class="role-fields-header"><h4>Visitor Information</h4><p>Update your visitor details.</p></div>
        <div class="form-row"><div class="form-group"><label>Organization</label><input type="text" id="editOrganization" value="${escapeHTML(currentUser.organization || "")}"></div>
        <div class="form-group"><label>Host / Contact Person</label><input type="text" id="editHostName" value="${escapeHTML(currentUser.hostName || "")}"></div></div>
        <div class="form-group"><label>Purpose of Visit</label><input type="text" id="editVisitPurpose" value="${escapeHTML(currentUser.visitPurpose || "")}"></div></div>`;
    }
    container.innerHTML = html;
}

function fillEditProfileForm() {
    if (!currentUser) return;
    const fields = {
        editFirstName: currentUser.firstName || "",
        editLastName: currentUser.lastName || "",
        editEmail: currentUser.email || "",
        editPhone: currentUser.phone || "",
        editRole: formatRole(currentUser.role)
    };
    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
    renderEditRoleFields(currentUser.role);
}

if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
        fillEditProfileForm();
        if (editProfileSection) {
            editProfileSection.style.display = "block";
            editProfileSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}
if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
        if (editProfileSection) editProfileSection.style.display = "none";
    });
}

function validateStrongPassword(pw) {
    return {
        length: pw.length >= 8,
        uppercase: /[A-Z]/.test(pw),
        lowercase: /[a-z]/.test(pw),
        number: /[0-9]/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw)
    };
}
function isStrongPassword(pw) {
    return Object.values(validateStrongPassword(pw)).every(Boolean);
}
function updateEditPasswordRequirements(pw) {
    const req = validateStrongPassword(pw);
    const map = { length: "editReqLength", uppercase: "editReqUppercase", lowercase: "editReqLowercase", number: "editReqNumber", special: "editReqSpecial" };
    Object.entries(map).forEach(([k, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle("valid", req[k]);
        el.classList.toggle("invalid", !req[k]);
    });
}
const editNewPassword = document.getElementById("editNewPassword");
if (editNewPassword) {
    editNewPassword.addEventListener("input", function () { updateEditPasswordRequirements(this.value); });
}

if (editProfileForm) {
    editProfileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentUser) return;

        const firstName = document.getElementById("editFirstName")?.value.trim();
        const lastName = document.getElementById("editLastName")?.value.trim();
        const email = document.getElementById("editEmail")?.value.trim();
        const phone = document.getElementById("editPhone")?.value.trim();
        const role = currentUser.role;
        const currentPassword = document.getElementById("currentPassword")?.value || "";
        const newPassword = document.getElementById("editNewPassword")?.value || "";
        const confirmPassword = document.getElementById("editConfirmPassword")?.value || "";

        if (!firstName || !lastName) { alert("Please enter your first name and last name."); return; }
        if (!email) { alert("Please enter a valid email address."); return; }

        const emailTaken = accounts.some(a => a !== currentUser && String(a.email).toLowerCase() === email.toLowerCase());
        if (emailTaken) { alert("This email address is already being used by another account."); return; }

        if (currentPassword || newPassword || confirmPassword) {
            if (currentPassword !== currentUser.password) { alert("Your current password is incorrect."); return; }
            if (!isStrongPassword(newPassword)) { alert("Your new password does not meet all password requirements."); return; }
            if (newPassword !== confirmPassword) { alert("The new passwords do not match."); return; }
        }

        const updated = { ...currentUser, firstName, lastName, email, phone, role };

        if (role === "student") {
            updated.faculty = document.getElementById("editFaculty")?.value.trim() || "";
            updated.department = document.getElementById("editDepartment")?.value.trim() || "";
            updated.matricNumber = document.getElementById("editMatricNumber")?.value.trim() || "";
            updated.level = document.getElementById("editLevel")?.value.trim() || "";
        } else if (role === "academicStaff") {
            updated.academicFaculty = document.getElementById("editAcademicFaculty")?.value.trim() || "";
            updated.academicDepartment = document.getElementById("editAcademicDepartment")?.value.trim() || "";
            updated.academicStaffId = document.getElementById("editAcademicStaffId")?.value.trim() || "";
            updated.academicPosition = document.getElementById("editAcademicPosition")?.value.trim() || "";
        } else if (role === "nonAcademicStaff") {
            updated.staffUnit = document.getElementById("editStaffUnit")?.value.trim() || "";
            updated.nonAcademicStaffId = document.getElementById("editNonAcademicStaffId")?.value.trim() || "";
            updated.staffPosition = document.getElementById("editStaffPosition")?.value.trim() || "";
        } else if (role === "security") {
            updated.securityId = document.getElementById("editSecurityId")?.value.trim() || "";
            updated.securityUnit = document.getElementById("editSecurityUnit")?.value.trim() || "";
            updated.securityPost = document.getElementById("editSecurityPost")?.value.trim() || "";
        } else if (role === "visitor") {
            updated.organization = document.getElementById("editOrganization")?.value.trim() || "";
            updated.hostName = document.getElementById("editHostName")?.value.trim() || "";
            updated.visitPurpose = document.getElementById("editVisitPurpose")?.value.trim() || "";
        }

        if (newPassword) updated.password = newPassword;

        const idx = accounts.findIndex(a => String(a.email).toLowerCase() === String(currentUser.email).toLowerCase());
        if (idx !== -1) {
            accounts[idx] = updated;
            saveAccounts(accounts);
            currentUser = updated;
            localStorage.setItem(DASHBOARD_CURRENT_USER_KEY, updated.email);
        }

        displayUserInfo();
        displayProfile();
        if (editProfileSection) editProfileSection.style.display = "none";
        alert("Profile updated successfully.");
    });
}

// Password show/hide toggles (attached only once)
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", function () {
        const input = document.getElementById(this.dataset.target);
        if (!input) return;
        if (input.type === "password") {
            input.type = "text";
            this.textContent = "Hide";
        } else {
            input.type = "password";
            this.textContent = "👁";
        }
    });
});
function displayStatistics() {
    let reports;
    if (canCurrentUserMonitor()) {
        // Security officers see ALL reports
        reports = getReports();
    } else {
        // Normal users only see their own reports
        reports = getReports().filter(isReportOwnedByCurrentUser);
    }

    const set = (id, n) => {
        const el = document.getElementById(id);
        if (el) el.textContent = n;
    };

    set("totalReports", reports.length);
    set("pendingReports", reports.filter(r => (r.status || "Pending").toLowerCase() === "pending").length);
    set("investigatingReports", reports.filter(r => (r.status || "").toLowerCase() === "investigating").length);
    set("resolvedReports", reports.filter(r => (r.status || "").toLowerCase() === "resolved").length);
}
function statusBadge(status) {
    const s = (status || "Pending").toLowerCase();
    let cls = "status-pending";
    if (s === "resolved") cls = "status-resolved";
    else if (s === "investigating") cls = "status-investigating";
    return '<span class="status ' + cls + '">' + escapeHTML(capitalize(status || "Pending")) + '</span>';
}

function displayRecentReports() {
    const tbody = document.getElementById("reportsTable");
    if (!tbody) return;

    // Authorized monitoring users can see all reports.
    // Everyone else can see only their own reports.
    const reports = getReports()
        .filter(report =>
            canCurrentUserMonitor() ||
            isReportOwnedByCurrentUser(report)
        )
        .slice()
        .sort((a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 8);

    if (!reports.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">No incident reports available.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reports.map(r => `
        <tr>
            <td>${escapeHTML(r.incidentType || "—")}</td>
            <td>${escapeHTML(r.location || "—")}</td>
            <td>${formatDate(r.incidentDate)}</td>
            <td>${escapeHTML(r.reporterName || "—")}</td>
            <td>${statusBadge(r.status)}</td>
            <td>${escapeHTML(r.incidentTime || "—")}</td>
        </tr>
    `).join("");
}

function displayMyReports() {

const tbody = document.getElementById("myReportsTable");

if (!tbody) return;

const reports = getReports()
    .filter(isReportOwnedByCurrentUser)
    .sort((a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

if (!reports.length) {
    tbody.innerHTML = `
        <tr>
            <td colspan="9">
                You have not submitted any reports yet.
            </td>
        </tr>
    `;
    return;
}

tbody.innerHTML = reports.map(r => {

    /* CHECK INVESTIGATION INFORMATION */

    const hasInvestigationUpdate = [
        r.investigationFindings,
        r.investigationAction,
        r.investigationOutcome,
        r.recoveryInformation
    ].some(value =>
        String(value || "").trim() !== ""
    );

    /* VIEW INVESTIGATION UPDATE BUTTON */

    const invBtn = hasInvestigationUpdate
        ? `<button
                type="button"
                class="investigation-btn"
                onclick="viewReporterInvestigation(${Number(r.id)})">
                View Investigation Update
           </button>`
        : "No update yet";

    /* REQUEST INVESTIGATION UPDATE BUTTON */

    const reqBtn = !r.updateRequestPending
        ? `<button
                type="button"
                class="investigation-btn"
                onclick="requestInvestigationUpdate(${Number(r.id)})">
                Request Update
           </button>`
        : "Awaiting response";

    /* COMMUNICATION HISTORY BUTTON */

    const histBtn = `
        <button
            type="button"
            class="investigation-btn"
            onclick="viewCommunicationHistory(${Number(r.id)})">
            History
        </button>
    `;

    /* REPLY TO SECURITY QUESTION BUTTON */

    
const qBtn =
    r.securityQuestion &&
    r.questionStatus === "Awaiting Reporter Reply" &&
    r.reporterQuestionAnswered !== true
        ? `<button
                type="button"
                class="investigation-btn"
                onclick="openReporterQuestionReply(${Number(r.id)})">
                Reply to Security
           </button>`
        : "No reply required";
        

    /* VIEW SECURITY RESPONSE BUTTON */

    const respBtn = r.updateRequestResponse
        ? `<button
                type="button"
                class="investigation-btn"
                onclick="viewInvestigatorResponse(${Number(r.id)})">
                View Security Response
           </button>`
        : "No response yet";

    return `
        <tr>
            <td>${escapeHTML(r.incidentType || "—")}</td>

            <td>${escapeHTML(r.location || "—")}</td>

            <td>${formatDate(r.incidentDate)}</td>

            <td>${escapeHTML(r.incidentTime || "—")}</td>

            <td>${statusBadge(r.status)}</td>

            <td>${escapeHTML(r.id || "—")}</td>
<td class="investigation-column">
    <div class="investigation-item">
        ${invBtn}
    </div>

    <div class="investigation-item">
        ${reqBtn}
    </div>
</td>


            <td class="history-column">
                ${histBtn}
            </td>

            <td class="security-communication-column">
    <div>${qBtn}</div>
    <div>${respBtn}</div>
</td>
        </tr>
    `;

}).join("");

}
function displayMonitoringReports() {
    if (!canCurrentUserMonitor()) return;
    const tbody = document.getElementById("monitoringReportsTable");
    if (!tbody) return;
    const reports = getReports().slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
    set("monitoringTotalReports", reports.length);
    set("monitoringPendingReports", reports.filter(r => (r.status || "Pending").toLowerCase() === "pending").length);
    set("monitoringInvestigatingReports", reports.filter(r => (r.status || "").toLowerCase() === "investigating").length);
    set("monitoringResolvedReports", reports.filter(r => (r.status || "").toLowerCase() === "resolved").length);

    if (!reports.length) {
        tbody.innerHTML = `<tr><td colspan="11">No incident reports available.</td></tr>`;
        return;
    }
    tbody.innerHTML = reports.map(r => {
        
        const status = (r.status || "Pending").toLowerCase();
let actionBtns = "";

// 1. Pending → only Start Investigation
if (status === "pending") {
    actionBtns += `<button type="button" class="investigation-btn" onclick="startInvestigation(${Number(r.id)})">Start Investigation</button>`;
}

// 2. After investigation has started
if (status === "investigating" || status === "resolved") {
    if (status === "investigating") {
        actionBtns += `<button type="button" class="investigation-btn" onclick="markAsResolved(${Number(r.id)})">Mark Resolved</button>`;
    }
}
// View Reply only when reporter has replied AND it has not been viewed yet
if (r.reporterReply && r.replyViewed !== true) {
    actionBtns += `<button type="button" class="investigation-btn" onclick="viewReporterReply(${Number(r.id)})">View Reply</button>`;
}


// Respond to update request (if pending)
if (r.updateRequestPending) {
    actionBtns += `<button type="button" class="investigation-btn" onclick="respondToUpdateRequest(${Number(r.id)})">Respond to Request</button>`;
}
        return `<tr>
            <td>${escapeHTML(r.id || "—")}</td>
            <td>${escapeHTML(r.incidentType || "—")}</td>
            <td>${escapeHTML(r.location || "—")}</td>
            <td>${formatDate(r.incidentDate)}</td>
            <td>${escapeHTML(r.incidentTime || "—")}</td>
            <td>${escapeHTML(r.reporterName || "—")}</td>
            <td>${statusBadge(r.status)}</td>
            <td><button type="button" class="investigation-btn" onclick="viewCommunicationHistory(${Number(r.id)})">History</button></td>
            <td><button type="button" class="investigation-btn" onclick="viewFullReport(${Number(r.id)})">View Full Report</button></td>
            <td><button type="button" class="investigation-btn" onclick="viewReporterDetails(${Number(r.id)})">View Reporter Details</button></td>
            <td>
    <button
        type="button"
        class="investigation-btn"
        onclick="openInvestigationUpdate(${Number(r.id)})">
        Update Details
    </button>

    ${
        r.status &&
        (r.status.toLowerCase() === "investigating" ||
         r.status.toLowerCase() === "resolved")
        ? `<button
                type="button"
                class="investigation-btn"
                onclick="openReporterQuestion(${Number(r.id)})">
                Ask Question
           </button>`
        : ""
    }
</td>
            <td>${actionBtns}</td>
        </tr>`;
    }).join("");
}
const incidentForm = document.getElementById("incidentForm");
if (incidentForm) {
    incidentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentUser) return;

        const incidentType = document.getElementById("incidentType")?.value;
        const location = document.getElementById("location")?.value.trim();
        const incidentDate = document.getElementById("incidentDate")?.value;
        const incidentTime = document.getElementById("incidentTime")?.value;
        const description = document.getElementById("description")?.value.trim();
        const additionalInfo = document.getElementById("additionalInfo")?.value.trim() || "";

        if (!incidentType || !location || !incidentDate || !incidentTime || !description) {
            alert("Please complete all required fields.");
            return;
        }

        const reports = getReports();
        const newReport = {
            id: Date.now(),
            incidentType: incidentType,
            location: location,
            incidentDate: incidentDate,
            incidentTime: incidentTime,
            description: description,
            additionalInfo: additionalInfo,
            status: "Pending",
            reporterEmail: currentUser.email,
            reporterName: getFullName(currentUser),
            createdAt: new Date().toISOString(),
            communicationHistory: [],
            newReportNotification: true
        };

        reports.push(newReport);
        saveReports(reports);

        incidentForm.reset();

        displayStatistics();
        displayRecentReports();
        displayMyReports();
        if (canCurrentUserMonitor()) displayMonitoringReports();

        alert("Incident report submitted successfully.");
        showSection("dashboard");
    });
}
function viewReporterDetails(reportId) {
    if (!canCurrentUserMonitor()) {
        alert("You are not authorized to view reporter details.");
        return;
    }

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));
    if (!report) {
        alert("Report not found.");
        return;
    }

    // Find the full account of the reporter
    const accounts = getAccounts();
    const reporter = accounts.find(a =>
        String(a.email || "").toLowerCase() === String(report.reporterEmail || "").toLowerCase()
    );

    if (!reporter) {
        alert("Reporter account details could not be found.");
        return;
    }

    // Build safe details (no password, no security questions)
    let details = "REPORTER DETAILS\n\n";
    details += "Full Name: " + getFullName(reporter) + "\n";
    details += "Email: " + (reporter.email || "—") + "\n";
    details += "Phone: " + (reporter.phone || "—") + "\n";
    details += "Account Type: " + formatRole(reporter.role) + "\n";

    // Role-specific information
    if (reporter.role === "student") {
        details += "Faculty: " + (reporter.faculty || "—") + "\n";
        details += "Department: " + (reporter.department || "—") + "\n";
        details += "Matric Number: " + (reporter.matricNumber || "—") + "\n";
        details += "Level: " + (reporter.level || "—") + "\n";
    } else if (reporter.role === "academicStaff") {
        details += "Faculty: " + (reporter.academicFaculty || "—") + "\n";
        details += "Department: " + (reporter.academicDepartment || "—") + "\n";
        details += "Staff ID: " + (reporter.academicStaffId || "—") + "\n";
        details += "Position: " + (reporter.academicPosition || "—") + "\n";
    } else if (reporter.role === "nonAcademicStaff") {
        details += "Unit/Office: " + (reporter.staffUnit || "—") + "\n";
        details += "Staff ID: " + (reporter.nonAcademicStaffId || "—") + "\n";
        details += "Position: " + (reporter.staffPosition || "—") + "\n";
    } else if (reporter.role === "security") {
        details += "Security ID: " + (reporter.securityId || "—") + "\n";
        details += "Unit: " + (reporter.securityUnit || "—") + "\n";
        details += "Post: " + (reporter.securityPost || "—") + "\n";
    } else if (reporter.role === "visitor") {
        details += "Organization: " + (reporter.organization || "—") + "\n";
        details += "Purpose of Visit: " + (reporter.visitPurpose || "—") + "\n";
        details += "Host: " + (reporter.hostName || "—") + "\n";
    }

    alert(details);
}function viewFullReport(reportId) {
    if (!canCurrentUserMonitor()) {
        alert("You are not authorized to view this report.");
        return;
    }

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));
    if (!report) {
        alert("Report not found.");
        return;
    }

    let details = "FULL INCIDENT REPORT\n\n";
    details += "Report ID: " + (report.id || "—") + "\n";
    details += "Incident Type: " + (report.incidentType || "—") + "\n";
    details += "Location: " + (report.location || "—") + "\n";
    details += "Date: " + (report.incidentDate || "—") + "\n";
    details += "Time: " + (report.incidentTime || "—") + "\n";
    details += "Status: " + (report.status || "Pending") + "\n";
    details += "Reporter: " + (report.reporterName || "—") + "\n\n";
    details += "DESCRIPTION:\n" + (report.description || "No description provided.") + "\n\n";
    details += "ADDITIONAL INFORMATION:\n" + (report.additionalInfo || "None") + "\n";

    if (report.investigationFindings) {
        details += "\n--- INVESTIGATION ---\n";
        details += "Findings: " + report.investigationFindings + "\n";
        details += "Action Taken: " + (report.investigationAction || "—") + "\n";
        details += "Outcome: " + (report.investigationOutcome || "—") + "\n";
        details += "Recovery Info: " + (report.recoveryInformation || "—") + "\n";
    }

    alert(details);
}
function startInvestigation(reportId) {
    if (!canCurrentUserMonitor()) return;

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));
    if (!report) {
        alert("Report not found.");
        return;
    }

    report.status = "Investigating";
    report.investigationStartedNotification = true;   // ← new flag for reporter
    report.investigationStartedAt = new Date().toISOString();

    // Also add to history
    if (!Array.isArray(report.communicationHistory)) {
        report.communicationHistory = [];
    }
    report.communicationHistory.push({
        sender: "Security Officer",
        message: "Investigation has been started on this report.",
        sentAt: new Date().toISOString()
    });

    saveReports(reports);
    displayMonitoringReports();
    displayStatistics();
    displayRecentReports();
    displayNotifications();          // refresh notifications
    alert("Investigation started.");
}
function markAsResolved(reportId) {
    if (!canCurrentUserMonitor()) return;
    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));
    if (!report) {
        alert("Report not found.");
        return;
    }
    report.status = "Resolved";
    report.resolvedNotification = true;          // notify the reporter
    report.resolvedAt = new Date().toISOString();

    if (!Array.isArray(report.communicationHistory)) {
        report.communicationHistory = [];
    }
    report.communicationHistory.push({
        sender: "Security Officer",
        message: "Investigation has been marked as Resolved.",
        sentAt: new Date().toISOString()
    });

    saveReports(reports);
    displayMonitoringReports();
    displayStatistics();
    displayRecentReports();
    displayNotifications();
    alert("Report marked as Resolved.");
}
function openInvestigationUpdate(reportId) {
    if (!canCurrentUserMonitor()) return;
    const report = getReports().find(r => Number(r.id) === Number(reportId));
    if (!report) { alert("Report could not be found."); return; }
    const panel = document.getElementById("investigationUpdatePanel");
    document.getElementById("investigationReportId").value = report.id;
    document.getElementById("investigationFindings").value = report.investigationFindings || "";
    document.getElementById("investigationAction").value = report.investigationAction || "";
    document.getElementById("investigationOutcome").value = report.investigationOutcome || "";
    document.getElementById("recoveryInformation").value = report.recoveryInformation || "";
    if (panel) { panel.style.display = "block"; panel.scrollIntoView({ behavior: "smooth" }); }
}

const investigationUpdateForm = document.getElementById("investigationUpdateForm");
if (investigationUpdateForm) {
    investigationUpdateForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!canCurrentUserMonitor()) return;
        const id = document.getElementById("investigationReportId").value;
        const reports = getReports();
        const report = reports.find(r => Number(r.id) === Number(id));
        if (!report) { alert("Report could not be found."); return; }
        report.investigationFindings = document.getElementById("investigationFindings").value.trim();
        report.investigationAction = document.getElementById("investigationAction").value.trim();
        report.investigationOutcome = document.getElementById("investigationOutcome").value.trim();
        report.recoveryInformation = document.getElementById("recoveryInformation").value.trim();
        report.investigationUpdatedAt = new Date().toISOString();
        report.investigationUpdateRead = false;
        if (!Array.isArray(report.communicationHistory)) report.communicationHistory = [];
        report.communicationHistory.push({
            sender: "Security Officer",
            message: "Investigation update saved.",
            sentAt: new Date().toISOString()
        });
        saveReports(reports);
        document.getElementById("investigationUpdatePanel").style.display = "none";
        displayMonitoringReports();
        displayMyReports();
        displayStatistics();
        alert("Investigation update saved.");
    });
}

function openReporterQuestion(reportId) {
    if (!canCurrentUserMonitor()) return;
    const panel = document.getElementById("reporterQuestionPanel");
    document.getElementById("questionReportId").value = reportId;
    document.getElementById("reporterQuestion").value = "";
    if (panel) { panel.style.display = "block"; panel.scrollIntoView({ behavior: "smooth" }); }
}

const reporterQuestionForm = document.getElementById("reporterQuestionForm");
if (reporterQuestionForm) {
    reporterQuestionForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!canCurrentUserMonitor()) return;

        const id = document.getElementById("questionReportId").value;
        const question = document.getElementById("reporterQuestion").value.trim();
        if (!question) {
            alert("Please enter a question.");
            return;
        }

        const reports = getReports();
        const report = reports.find(r => Number(r.id) === Number(id));
        if (!report) {
            alert("Report could not be found.");
            return;
        }

        // === KEY FIXES ===
        report.securityQuestion = question;
        report.questionStatus = "Awaiting Reporter Reply";
        report.questionRead = false;
        report.reporterQuestionAnswered = false;   // ← CRITICAL
        report.reporterReply = "";
        report.reporterDraftReply = "";
        report.replyViewed = false;
        // ==================

        if (!Array.isArray(report.communicationHistory)) {
            report.communicationHistory = [];
        }
        report.communicationHistory.push({
            sender: "Security Officer",
            message: question,
            sentAt: new Date().toISOString()
        });

        saveReports(reports);

        displayMonitoringReports();
        displayNotifications();

        document.getElementById("reporterQuestionPanel").style.display = "none";
        alert("Question saved successfully. The reporter's notification will appear when they log in.");
    });
}
function openReporterQuestionReply(reportId) {

    const reports = getReports();

    const report = reports.find(
        r =>
            String(r.id) === String(reportId) &&
            isReportOwnedByCurrentUser(r)
    );

    if (!report) {
        alert("Report not found.");
        return;
    }

    if (!report.securityQuestion) {
        alert("There is no security question for this report.");
        return;
    }

    const panel = document.getElementById(
        "reporterQuestionReplyPanel"
    );

    const questionText = document.getElementById(
        "securityQuestionText"
    );

    const replyId = document.getElementById(
        "replyReportId"
    );

    const replyBox = document.getElementById(
        "reporterReply"
    );

    if (!panel || !questionText || !replyId || !replyBox) {
        alert("The reply form could not be found. Please check dashboard.html.");
        return;
    }

    // First show the parent My Reports section.
    showSection("myReports");

    // Fill in the question and reply form.
    questionText.textContent = report.securityQuestion;
    replyId.value = report.id;
    replyBox.value = report.reporterDraftReply || "";

    // Now show the reply panel.
    panel.style.display = "block";
    panel.style.visibility = "visible";

    // Scroll directly to the reply form.
    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

// Make the function available to the notification button.
window.openReporterQuestionReply = openReporterQuestionReply;

/* ==========================================
   REPORTER SENDS A REPLY TO SECURITY
========================================== */

const reporterReplyForm = document.getElementById(
    "reporterReplyForm"
);

if (reporterReplyForm) {

    reporterReplyForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const reportId = document.getElementById(
            "replyReportId"
        ).value;

        const replyBox = document.getElementById(
            "reporterReply"
        );

        const message = replyBox.value.trim();

        if (!message) {
            alert("Please enter your reply.");
            return;
        }

        const reports = getReports();

        const report = reports.find(
            r =>
                String(r.id) === String(reportId) &&
                isReportOwnedByCurrentUser(r)
        );

        if (!report) {
            alert("Report not found or you are not authorized to reply.");
            return;
        }

/* SAVE THE REPORTER'S REPLY FOR SECURITY */

report.reporterReply = message;
report.reporterDraftReply = message;
report.reporterQuestionAnswered = true;
report.reporterRepliedAt = new Date().toISOString();
report.replyViewed = false;
// The reporter has answered the security question.
report.questionStatus = "Reporter Replied";
report.questionRead = true;
// === THIS PART IS VERY IMPORTANT ===
// Add the reply to communication history so it shows for both sides
if (!Array.isArray(report.communicationHistory)) {
    report.communicationHistory = [];
}
report.communicationHistory.push({
    sender: "Reporter",
    message: message,
    sentAt: new Date().toISOString()
});
// ================================
        localStorage.setItem(
            "campusReports",
            JSON.stringify(reports)
        );

        alert("Your reply has been saved successfully.");

        replyBox.value = "";

        const panel = document.getElementById(
            "reporterQuestionReplyPanel"
        );

        if (panel) {
            panel.style.display = "none";
        }

        showSection("myReports");
        displayNotifications();

    });

}

function viewCommunicationHistory(reportId) {
    const report = getReports().find(r => Number(r.id) === Number(reportId));
    if (!report) { alert("Report could not be found."); return; }
    if (!canCurrentUserMonitor() && !isReportOwnedByCurrentUser(report)) {
        alert("You are not authorized to view this history.");
        return;
    }
    const panel = document.getElementById("communicationHistoryPanel");
    const content = document.getElementById("communicationHistoryContent");
    const history = Array.isArray(report.communicationHistory) ? report.communicationHistory : [];
    if (!history.length) {
        content.innerHTML = "<p>No communication history is available for this report.</p>";
    } else {
        content.innerHTML = history.map(item => `
            <div class="communication-message">
                <div class="communication-header">
                    <strong>${escapeHTML(item.sender || "Unknown")}</strong>
                    <small>${item.sentAt ? new Date(item.sentAt).toLocaleString() : "Date not available"}</small>
                </div>
                <p>${escapeHTML(item.message || "")}</p>
            </div>`).join("");
    }
    if (panel) { panel.style.display = "block"; panel.scrollIntoView({ behavior: "smooth" }); }
}
document.getElementById("closeCommunicationHistory")?.addEventListener("click", () => {
    document.getElementById("communicationHistoryPanel").style.display = "none";
});

function requestInvestigationUpdate(reportId) {
    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));

    if (!report || !isReportOwnedByCurrentUser(report)) {
        alert("You are not authorized to request an update for this report.");
        return;
    }

    // Show the proper panel instead of prompt()
    document.getElementById("requestUpdateReportId").value = reportId;
    document.getElementById("requestUpdateMessage").value = "";
    
    const panel = document.getElementById("requestUpdatePanel");
    if (panel) {
        // Make sure we are on My Reports section
        showSection("myReports");
        panel.style.display = "block";
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("requestUpdateMessage").focus();
    }
}

// Submit handler for the new panel
document.getElementById("submitRequestUpdateBtn")?.addEventListener("click", function () {
    const reportId = document.getElementById("requestUpdateReportId").value;
    const message = document.getElementById("requestUpdateMessage").value.trim();

    if (!message) {
        alert("Please enter your request before submitting.");
        return;
    }

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId) && isReportOwnedByCurrentUser(r));

    if (!report) {
        alert("Report not found or you are not authorized.");
        return;
    }

    if (!Array.isArray(report.communicationHistory)) {
        report.communicationHistory = [];
    }

    const sentAt = new Date().toISOString();
    report.communicationHistory.push({
        sender: "Reporter (Update Request)",
        message: message,
        sentAt: sentAt
    });

    report.updateRequestPending = true;
    report.updateRequestSentAt = sentAt;
    report.updateRequestStatus = "Awaiting Security Response";

    saveReports(reports);

    // Hide panel
    document.getElementById("requestUpdatePanel").style.display = "none";

    displayMyReports();
    if (canCurrentUserMonitor()) displayMonitoringReports();
    displayNotifications();

    alert("Your request has been submitted successfully.");
});

// Cancel button
document.getElementById("cancelRequestUpdateBtn")?.addEventListener("click", function () {
    document.getElementById("requestUpdatePanel").style.display = "none";
});
// Cancel button for "Ask Question" panel (Security)
document.addEventListener("click", function (e) {
    // Handles both possible IDs that people commonly use
    if (e.target.closest("#cancelReporterQuestion") || 
        e.target.closest("#cancelQuestionBtn") ||
        e.target.closest("[data-cancel-question]")) {
        
        e.preventDefault();

        const panel = document.getElementById("reporterQuestionPanel");
        if (panel) {
            panel.style.display = "none";
        }

        // Also clear the question field
        const questionBox = document.getElementById("reporterQuestion");
        if (questionBox) {
            questionBox.value = "";
        }
    }
});
function respondToUpdateRequest(reportId) {
    if (!canCurrentUserMonitor()) {
        alert("You are not authorized to respond.");
        return;
    }

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));

    if (!report) {
        alert("Report could not be found.");
        return;
    }

    if (!report.updateRequestPending) {
        alert("There is no pending update request.");
        return;
    }

    // Get the last request message from the reporter
    const lastReq = (report.communicationHistory || [])
        .filter(i => i.sender === "Reporter (Update Request)")
        .slice(-1)
        .map(i => i.message)
        .join("\n\n") || "No request message found.";

    // Fill the panel
    document.getElementById("respondUpdateReportId").value = reportId;
    document.getElementById("reporterRequestText").textContent = lastReq;
    document.getElementById("securityResponseMessage").value = "";

    // Show the panel
    const panel = document.getElementById("respondUpdatePanel");
    if (panel) {
        // Make sure we are on the Monitoring section
        showSection("monitoring");
        panel.style.display = "block";
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("securityResponseMessage").focus();
    }
}

// Submit the response
document.getElementById("submitSecurityResponseBtn")?.addEventListener("click", function () {
    if (!canCurrentUserMonitor()) return;

    const reportId = document.getElementById("respondUpdateReportId").value;
    const message = document.getElementById("securityResponseMessage").value.trim();

    if (!message) {
        alert("Please enter a response.");
        return;
    }

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));

    if (!report) {
        alert("Report could not be found.");
        return;
    }

    if (!Array.isArray(report.communicationHistory)) {
        report.communicationHistory = [];
    }

    const sentAt = new Date().toISOString();

    report.communicationHistory.push({
        sender: "Security Officer",
        message: message,
        sentAt: sentAt
    });

    report.updateRequestResponse = message;
    report.updateRequestResponseAt = sentAt;
    report.updateRequestPending = false;
    report.updateRequestStatus = "Response Sent";
    report.updateResponseRead = false;

    saveReports(reports);

    // Hide panel
    document.getElementById("respondUpdatePanel").style.display = "none";

    displayMonitoringReports();
    displayMyReports();
    displayNotifications();

    alert("Your response has been saved successfully.");
});

// Cancel button
document.getElementById("cancelSecurityResponseBtn")?.addEventListener("click", function () {
    document.getElementById("respondUpdatePanel").style.display = "none";
});
function viewInvestigatorResponse(reportId) {
    const report = getReports().find(r => Number(r.id) === Number(reportId) && isReportOwnedByCurrentUser(r));
    if (!report) { alert("Report could not be found."); return; }
    if (!report.updateRequestResponse) {
        alert("No investigator response was found. Please check the Communication History.");
        return;
    }
    const date = report.updateRequestResponseAt
        ? new Date(report.updateRequestResponseAt).toLocaleString() : "Date not available";
    alert("INVESTIGATOR RESPONSE\n\n" + report.updateRequestResponse + "\n\nResponse date: " + date);
}
function openInvestigatorResponseFromNotification(reportId) {
    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId) && isReportOwnedByCurrentUser(r));
    if (!report || !report.updateRequestResponse) { alert("No investigator response is available."); return; }
    report.updateResponseRead = true;
    saveReports(reports);
    displayNotifications();
    viewInvestigatorResponse(reportId);
}

function viewReporterReply(reportId) {
    if (!canCurrentUserMonitor()) return;

    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));
    if (!report) {
        alert("Report not found.");
        return;
    }

    const panel = document.getElementById("reporterReplyPanel");
    document.getElementById("securityQuestionForOfficer").textContent = report.securityQuestion || "—";
    document.getElementById("reporterReplyForOfficer").textContent = report.reporterReply || "—";

    // Mark the reply as viewed so the button disappears
    report.replyViewed = true;
    saveReports(reports);
displayNotifications();
    if (panel) {
        panel.style.display = "block";
        panel.scrollIntoView({ behavior: "smooth" });
    }

    // Refresh the monitoring table so the button disappears immediately
    displayMonitoringReports();
}


function viewReporterInvestigation(reportId) {
    const reports = getReports();

    const report = reports.find(r =>
        Number(r.id) === Number(reportId) &&
        isReportOwnedByCurrentUser(r)
    );

    if (!report) {
        alert("Report could not be found.");
        return;
    }

    const hasUpdate = [
        report.investigationFindings,
        report.investigationAction,
        report.investigationOutcome,
        report.recoveryInformation
    ].some(value => String(value || "").trim() !== "");

    if (!hasUpdate) {
        alert("No investigation update is available yet.");
        return;
    }

    // Mark the update as read
    report.investigationUpdateRead = true;
    saveReports(reports);
    displayNotifications();

    const updateDate = report.investigationUpdatedAt
        ? new Date(report.investigationUpdatedAt).toLocaleString()
        : "Date not available";

    let details = "INVESTIGATION UPDATE\n\n";
    details += "Report ID: " + report.id + "\n\n";
    details += "Findings:\n" +
        (report.investigationFindings || "Not provided") + "\n\n";
    details += "Action Taken:\n" +
        (report.investigationAction || "Not provided") + "\n\n";
    details += "Outcome:\n" +
        (report.investigationOutcome || "Not provided") + "\n\n";
    details += "Recovery Information:\n" +
        (report.recoveryInformation || "Not provided") + "\n\n";
    details += "Last Updated: " + updateDate;

    alert(details);
}

function displayNotifications() {
    const section = document.getElementById("notificationSection");
    const msg = document.getElementById("notificationMessage");

    if (!section || !msg || !currentUser) return;

    const reports = getReports();
    const notifications = [];

    // ==========================================
    // SECURITY PERSONNEL NOTIFICATIONS
    // ==========================================
    if (canCurrentUserMonitor()) {

        reports.forEach(r => {
            const id = Number(r.id);

            // Reporter has replied to a security question
            if (r.reporterReply && r.replyViewed !== true) {
                notifications.push(`
                    <span style="display:block; margin-bottom:12px;">
                        🔔 Reporter replied to your question about Report #${escapeHTML(r.id)}.
                        <button type="button"
                            class="investigation-btn"
                            onclick="viewReporterReply(${id})">
                            View Reply
                        </button>
                    </span>
                `);
            }
            // New report submitted
if (r.newReportNotification === true) {
    notifications.push(`
        <span style="display:block; margin-bottom:12px;">
            🔔 New incident report submitted (Report #${escapeHTML(r.id)}).
            <button type="button" class="investigation-btn"
                onclick="markNewReportAsSeen(${id})">
                View Report
            </button>
        </span>
    `);
}

            // Reporter requested an investigation update
            if (r.updateRequestPending === true) {
                notifications.push(`
                    <span style="display:block; margin-bottom:12px;">
                        🔔 A reporter requested an investigation update for Report #${escapeHTML(r.id)}.
                        <button type="button"
                            class="investigation-btn"
                            onclick="respondToUpdateRequest(${id})">
                            Respond to Request
                        </button>
                    </span>
                `);
            }
        });

    } else {

        // ==========================================
        // REPORTER NOTIFICATIONS
        // ==========================================
        const myReports = reports.filter(isReportOwnedByCurrentUser);

        myReports.forEach(r => {
            const id = Number(r.id);

            // Security asked a question that the reporter
            // has not answered yet
            if (
                r.securityQuestion &&
                r.questionStatus === "Awaiting Reporter Reply" &&
                r.reporterQuestionAnswered !== true
            ) {
                notifications.push(`
                    <span style="display:block; margin-bottom:12px;">
                        🔔 Security has sent you a question about Report #${escapeHTML(r.id)}.
                        <button type="button"
                            class="investigation-btn"
                            onclick="window.openReporterQuestionReply(${id})">
                            Reply to Security
                        </button>
                    </span>
                `);
            }
            // Investigation started
if (r.investigationStartedNotification === true) {
    notifications.push(`
        <span style="display:block; margin-bottom:12px;">
            🔔 Security has started investigation on Report #${escapeHTML(r.id)}.
            <button type="button" class="investigation-btn"
                onclick="markInvestigationStartedAsSeen(${id})">
                Okay
            </button>
        </span>
    `);
}
// Investigation resolved
if (r.resolvedNotification === true) {
    notifications.push(`
        <span style="display:block; margin-bottom:12px;">
            🔔 Security has marked Report #${escapeHTML(r.id)} as Resolved.
            <button type="button" class="investigation-btn"
                onclick="markResolvedAsSeen(${id})">
                Okay
            </button>
        </span>
    `);
}
            // Security saved an investigation update
            const hasInvestigationUpdate = [
                r.investigationFindings,
                r.investigationAction,
                r.investigationOutcome,
                r.recoveryInformation
            ].some(value => String(value || "").trim() !== "");

            if (
                r.investigationUpdatedAt &&
                hasInvestigationUpdate &&
                r.investigationUpdateRead !== true
            ) {
                notifications.push(`
                    <span style="display:block; margin-bottom:12px;">
                        🔔 Security updated the investigation for Report #${escapeHTML(r.id)}.
                        <button type="button"
                            class="investigation-btn"
                            onclick="viewReporterInvestigation(${id})">
                            View Investigation Update
                        </button>
                    </span>
                `);
            }

            // Security responded to an update request
            if (
                r.updateRequestResponse &&
                r.updateRequestStatus === "Response Sent" &&
                r.updateResponseRead !== true
            ) {
                notifications.push(`
                    <span style="display:block; margin-bottom:12px;">
                        🔔 Security responded to your update request for Report #${escapeHTML(r.id)}.
                        <button type="button"
                            class="investigation-btn"
                            onclick="openInvestigatorResponseFromNotification(${id})">
                            View Response
                        </button>
                    </span>
                `);
            }
        });
    }

    // ==========================================
    // DISPLAY ALL CURRENT NOTIFICATIONS
    // ==========================================
    if (notifications.length > 0) {
        section.style.display = "block";
        msg.innerHTML = notifications.join("");
    } else {
        section.style.display = "none";
        msg.innerHTML = "";
    }
}

const deleteAccountButton = document.getElementById("showDeleteAccountBtn");
const deleteAccountFormSection = document.getElementById("deleteAccountFormSection");
const deleteAccountForm = document.getElementById("deleteAccountForm");
const cancelDeleteAccountButton = document.getElementById("cancelDeleteAccountBtn");

if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", () => {
        if (deleteAccountFormSection) {
            deleteAccountFormSection.style.display = "block";
            deleteAccountFormSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    });
}
if (cancelDeleteAccountButton) {
    cancelDeleteAccountButton.addEventListener("click", () => {
        if (deleteAccountFormSection) deleteAccountFormSection.style.display = "none";
        if (deleteAccountForm) deleteAccountForm.reset();
    });
}
 function markNewReportAsSeen(reportId) {
    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId));
    if (report) {
        report.newReportNotification = false;
        saveReports(reports);
        displayNotifications();
        // Optionally open the full report
        if (canCurrentUserMonitor()) {
            viewFullReport(reportId);
        }
    }
}

function markInvestigationStartedAsSeen(reportId) {
    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId) && isReportOwnedByCurrentUser(r));
    if (report) {
        report.investigationStartedNotification = false;
        saveReports(reports);
        displayNotifications();
    }
}
function markResolvedAsSeen(reportId) {
    const reports = getReports();
    const report = reports.find(r => Number(r.id) === Number(reportId) && isReportOwnedByCurrentUser(r));
    if (report) {
        report.resolvedNotification = false;
        saveReports(reports);
        displayNotifications();
    }
}
function getAccountDeletionMessage(reason) {
    const messages = {
        "Privacy concerns": "We understand that privacy matters. Thank you for sharing your concern. We will review your feedback as we work to improve CampusSafe.",
        "Difficult to use": "Thank you for letting us know. We will review your feedback and look for ways to make CampusSafe easier to use.",
        "Technical problems": "We're sorry you experienced technical problems. We will review your feedback to help identify improvements.",
        "Missing features": "Thank you for your suggestion. We will review your feedback when considering future CampusSafe improvements.",
        "No longer needed": "We understand. Thank you for being part of CampusSafe. If you ever need us again, we would be happy to welcome you back.",
        "Other": "Thank you for sharing your reason with us. We appreciate your feedback and would be happy to welcome you back in the future."
    };
    return messages[reason] || "Thank you for using CampusSafe. We would be happy to welcome you back whenever you need us.";
}

if (deleteAccountForm) {
    deleteAccountForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentUser || !currentUser.email) {
            alert("Your account could not be verified. Please log in again.");
            window.location.href = "login.html";
            return;
        }
        const reason = document.getElementById("deleteAccountReason")?.value;
        const feedback = document.getElementById("deleteAccountFeedback")?.value.trim() || "";
        if (!reason) { alert("Please select a reason for deleting your account."); return; }
        if (!confirm("Are you sure you want to permanently delete your CampusSafe account? This action cannot be undone.")) return;

        try {
            const key = "campusAccountDeletionFeedback";
            let records = [];
            try { records = JSON.parse(localStorage.getItem(key)) || []; } catch (_) {}
            if (!Array.isArray(records)) records = [];
            records.push({ reason, feedback, date: new Date().toISOString(), accountRole: currentUser.role || "User" });
            localStorage.setItem(key, JSON.stringify(records));
        } catch (_) {
            alert("Your feedback could not be saved. Account not deleted.");
            return;
        }

        try {
            const updated = getAccounts().filter(a =>
                String(a.email || "").trim().toLowerCase() !== String(currentUser.email).trim().toLowerCase()
            );
            saveAccounts(updated);
        } catch (_) {
            alert("We could not delete your account. Please try again.");
            return;
        }

        localStorage.removeItem(DASHBOARD_CURRENT_USER_KEY);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("rememberMe");
        alert("Your CampusSafe account has been deleted successfully.\n\n" + getAccountDeletionMessage(reason));
        window.location.replace("login.html");
    });
}

const editSecurityQuestionsForm = document.getElementById("editSecurityQuestionsForm");
const cancelSecurityQuestionsBtn = document.getElementById("cancelSecurityQuestionsBtn");

function loadExistingSecurityQuestions() {
    if (!editSecurityQuestionsForm || !currentUser) return;
    const email = String(currentUser.email || "").trim().toLowerCase();
    const account = getAccounts().find(u => String(u.email || "").trim().toLowerCase() === email);
    if (!account) return;
    let questions = [];
    if (Array.isArray(account.securityQuestions) && account.securityQuestions.length) {
        questions = account.securityQuestions;
    } else if (account.securityQuestion && account.securityAnswer) {
        questions = [{ question: account.securityQuestion, answer: account.securityAnswer }];
    }
    ["editSecurityQuestion1", "editSecurityQuestion2", "editSecurityQuestion3"].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.value = questions[i] ? questions[i].question : "";
    });
    ["editSecurityAnswer1", "editSecurityAnswer2", "editSecurityAnswer3"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    const pw = document.getElementById("securitySettingsCurrentPassword");
    if (pw) pw.value = "";
}

if (editSecurityQuestionsForm) {
    editSecurityQuestionsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentUser) { alert("Please log in again."); return; }
        const email = String(currentUser.email || "").trim().toLowerCase();
        const accountsList = getAccounts();
        const idx = accountsList.findIndex(u => String(u.email || "").trim().toLowerCase() === email);
        if (idx === -1) { alert("Your account could not be found."); return; }
        const account = accountsList[idx];
        const currentPw = document.getElementById("securitySettingsCurrentPassword").value;
        if (!currentPw || currentPw !== String(account.password || "")) {
            alert("Your current password is incorrect.");
            return;
        }
        const entries = [
            { q: document.getElementById("editSecurityQuestion1").value, a: document.getElementById("editSecurityAnswer1").value },
            { q: document.getElementById("editSecurityQuestion2").value, a: document.getElementById("editSecurityAnswer2").value },
            { q: document.getElementById("editSecurityQuestion3").value, a: document.getElementById("editSecurityAnswer3").value }
        ];
        const selected = [];
        const updated = [];
        for (let i = 0; i < entries.length; i++) {
            const q = entries[i].q.trim();
            const a = entries[i].a.trim();
            if (q && !a) { alert("Please enter the answer for Security Question " + (i + 1) + "."); return; }
            if (!q && a) { alert("Please select Security Question " + (i + 1) + " or clear its answer."); return; }
            if (!q) continue;
            if (selected.includes(q)) { alert("Please choose different security questions."); return; }
            selected.push(q);
            updated.push({ question: q, answer: a.toLowerCase() });
        }
        if (!updated.length) { alert("Please register at least one security question."); return; }
        account.securityQuestions = updated;
        account.securityQuestion = updated[0].question;
        account.securityAnswer = updated[0].answer;
        accountsList[idx] = account;
        saveAccounts(accountsList);
        currentUser.securityQuestions = updated;
        currentUser.securityQuestion = updated[0].question;
        currentUser.securityAnswer = updated[0].answer;
        alert("Your security questions have been updated successfully.");
        loadExistingSecurityQuestions();
    });
}
if (cancelSecurityQuestionsBtn) {
    cancelSecurityQuestionsBtn.addEventListener("click", loadExistingSecurityQuestions);
}
loadExistingSecurityQuestions();

document.querySelectorAll(".toggle-security-answer").forEach(btn => {
    btn.addEventListener("click", function () {
        const input = document.getElementById(this.dataset.target);
        if (!input) return;
        if (input.type === "password") { input.type = "text"; this.textContent = "Hide"; }
        else { input.type = "password"; this.textContent = "Show"; }
    });
});

document.addEventListener("click", function (e) {
    if (e.target.closest("#closeReporterQuestionReply")) {
        e.preventDefault();
        const p = document.getElementById("reporterQuestionReplyPanel");
        if (p) p.style.display = "none";
    }
    if (e.target.closest("#closeReporterReply")) {
        e.preventDefault();
        const p = document.getElementById("reporterReplyPanel");
        if (p) p.style.display = "none";
    }
    if (e.target.closest("#cancelInvestigationUpdate")) {
        e.preventDefault();
        const form = document.getElementById("investigationUpdateForm");
        if (form) form.reset();
        const p = document.getElementById("investigationUpdatePanel");
        if (p) p.style.display = "none";
    }
});


function initializeDashboard() {
    displayUserInfo();
    displayProfile();
    displayStatistics();
    updateMonitoringAccess();
    displayRecentReports();
    displayMyReports();
    displayNotifications();
    if (canCurrentUserMonitor()) displayMonitoringReports();
    showSection("dashboard");
}
initializeDashboard();