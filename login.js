/* =========================================================
   CAMPUSSAFE - LOGIN / REGISTER / PASSWORD SCRIPT
   ========================================================= */


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const ACCOUNTS_KEY = "campusAccounts";
const CURRENT_USER_KEY = "currentUserEmail";


/* =========================================================
   STORAGE HELPERS
   ========================================================= */

function getAccounts() {

    try {

        const accounts =
            JSON.parse(
                localStorage.getItem(
                    ACCOUNTS_KEY
                )
            );

        return Array.isArray(accounts)
            ? accounts
            : [];

    } catch (error) {

        return [];
    }
}


function saveAccounts(accounts) {

    localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );
}

/* =========================================================
   PASSWORD VALIDATION
   ========================================================= */

function validatePassword(password) {

    return {
        length: password.length >= 8,

        uppercase:
            /[A-Z]/.test(password),

        lowercase:
            /[a-z]/.test(password),

        number:
            /[0-9]/.test(password),

        special:
            /[^A-Za-z0-9]/.test(password)
    };
}


function isStrongPassword(password) {

    const requirements =
        validatePassword(password);

    return Object.values(
        requirements
    ).every(Boolean);
}





/* =========================================================
   PASSWORD REQUIREMENTS - REGISTRATION
   ========================================================= */

const registerPassword =
    document.getElementById(
        "password"
    );


if (registerPassword) {

    registerPassword.addEventListener(
        "input",
        function () {

            updatePasswordRequirements(
                this.value,
                "register"
            );

        }
    );
}

/* =========================================================
   UPDATE PASSWORD REQUIREMENTS
   Requirements appear when typing and disappear when met
   ========================================================= */

function updatePasswordRequirements(
    password,
    prefix
) {

    const requirements =
        validatePassword(password);


    /* -----------------------------------------
       Find the requirements container
       ----------------------------------------- */

    let containerId = "";

    if (prefix === "register") {
        containerId = "registerPasswordRequirements";
    }

    else if (prefix === "") {
        containerId = "passwordRequirements";
    }

    else if (prefix === "edit") {
        containerId = "editPasswordRequirements";
    }


    const container =
        document.getElementById(containerId);


    /* -----------------------------------------
       If password is empty, hide everything
       ----------------------------------------- */

    if (!password) {

        if (container) {
            container.style.display = "none";
        }

        return;
    }


    /* -----------------------------------------
       Show requirements when user starts typing
       ----------------------------------------- */

    if (container) {
        container.style.display = "block";
    }


    const mapping = {

        length:
            `${prefix}ReqLength`,

        uppercase:
            `${prefix}ReqUppercase`,

        lowercase:
            `${prefix}ReqLowercase`,

        number:
            `${prefix}ReqNumber`,

        special:
            `${prefix}ReqSpecial`
    };


    let allRequirementsMet = true;


    /* -----------------------------------------
       Show only requirements that are NOT met
       ----------------------------------------- */

    Object.entries(mapping).forEach(
        ([requirement, id]) => {

            const element =
                document.getElementById(id);


            if (!element) {
                return;
            }


            const isValid =
                requirements[requirement];


            if (isValid) {

                /* Condition has been satisfied.
                   Remove it from the screen. */

                element.style.display = "none";

            } else {

                /* Condition is still required. */

                element.style.display = "block";

                element.classList.add("invalid");

                element.classList.remove("valid");

                allRequirementsMet = false;
            }

        }
    );


    /* -----------------------------------------
       Hide the whole box when password is complete
       ----------------------------------------- */

    if (
        container &&
        allRequirementsMet
    ) {

        container.style.display = "none";
    }
}
/* =========================================================
   PASSWORD REQUIREMENTS - FORGOT PASSWORD
   ========================================================= */

const resetPassword =
    document.getElementById(
        "newPassword"
    );


if (resetPassword) {

    resetPassword.addEventListener(
        "input",
        function () {

            updatePasswordRequirements(
                this.value,
                ""
            );

        }
    );
}


/* =========================================================
   PASSWORD REQUIREMENTS - INITIAL EDIT PROFILE
   ========================================================= */

const editPassword =
    document.getElementById(
        "editNewPassword"
    );


if (editPassword) {

    editPassword.addEventListener(
        "input",
        function () {

            updatePasswordRequirements(
                this.value,
                "edit"
            );

        }
    );
}


/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

const passwordToggles =
    document.querySelectorAll(
        ".toggle-password"
    );


passwordToggles.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const targetId =
                    this.dataset.target;


                const passwordInput =
                    document.getElementById(
                        targetId
                    );


                if (!passwordInput) {
                    return;
                }


                if (
                    passwordInput.type ===
                    "password"
                ) {

                    passwordInput.type =
                        "text";

                    this.textContent =
                        "Hide";

                } else {

                    passwordInput.type =
                        "password";

                    this.textContent =
                        "Show";
                }

            }
        );

    }
);


/* =========================================================
   REGISTRATION ROLE FIELDS
   ========================================================= */

const registrationRole =
    document.getElementById(
        "role"
    );


const roleFieldContainers = {

    student:
        document.getElementById(
            "studentFields"
        ),

    academicStaff:
        document.getElementById(
            "academicStaffFields"
        ),

    nonAcademicStaff:
        document.getElementById(
            "nonAcademicStaffFields"
        ),

    security:
        document.getElementById(
            "securityFields"
        ),

    visitor:
        document.getElementById(
            "visitorFields"
        )
};


function hideAllRoleFields() {

    Object.values(
        roleFieldContainers
    ).forEach(
        container => {

            if (container) {

                container.style.display =
                    "none";
            }

        }
    );
}


function showRoleFields(role) {

    hideAllRoleFields();


    if (
        role &&
        roleFieldContainers[role]
    ) {

        roleFieldContainers[role]
            .style.display = "block";
    }
}


if (registrationRole) {

    registrationRole.addEventListener(
        "change",
        function () {

            showRoleFields(
                this.value
            );

        }
    );


    hideAllRoleFields();
}


/* =========================================================
   REGISTRATION PASSWORD MATCH
   ========================================================= */

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );


const passwordMatchMessage =
    document.getElementById(
        "passwordMatchMessage"
    );


function checkPasswordMatch() {

    if (
        !registerPassword ||
        !confirmPassword ||
        !passwordMatchMessage
    ) {
        return;
    }


    const password =
        registerPassword.value;


    const confirm =
        confirmPassword.value;


    if (!confirm) {

        passwordMatchMessage.textContent =
            "";

        passwordMatchMessage.className =
            "";

        return;
    }


    if (password === confirm) {

        passwordMatchMessage.textContent =
            "Passwords match.";

        passwordMatchMessage.className =
            "match";

    } else {

        passwordMatchMessage.textContent =
            "Passwords do not match.";

        passwordMatchMessage.className =
            "no-match";
    }
}


if (registerPassword) {

    registerPassword.addEventListener(
        "input",
        checkPasswordMatch
    );
}


if (confirmPassword) {

    confirmPassword.addEventListener(
        "input",
        checkPasswordMatch
    );
}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                )?.value.trim();


            const password =
                document.getElementById(
                    "password"
                )?.value;


            const role =
                document.getElementById(
                    "role"
                )?.value;


            const rememberMe =
                document.getElementById(
                    "rememberMe"
                )?.checked;


            if (
                !email ||
                !password ||
                !role
            ) {

                alert(
                    "Please complete all login fields."
                );

                return;
            }


            const accounts =
                getAccounts();


            /* -----------------------------------------
   FIND ACCOUNT BY EMAIL AND SELECTED ROLE
   ----------------------------------------- */

const account =
    accounts.find(
        user => {

            const storedRole =
                String(
                    user.role || ""
                ).trim();

            const normalizedStoredRole =
                storedRole === "Student"
                    ? "student"
                    : storedRole === "Academic Staff"
                    ? "academicStaff"
                    : storedRole === "Non-Academic Staff"
                    ? "nonAcademicStaff"
                    : storedRole === "Security Personnel"
                    ? "security"
                    : storedRole === "Visitor"
                    ? "visitor"
                    : storedRole;

            return (
                String(
                    user.email || ""
                ).trim().toLowerCase() ===
                email.toLowerCase() &&
                normalizedStoredRole === role
            );
        }
    )

/* -----------------------------------------
   CHECK WHETHER ACCOUNT EXISTS
   ----------------------------------------- */

if (!account) {

    const emailExists =
        accounts.some(
            user =>
                String(
                    user.email || ""
                ).trim().toLowerCase() ===
                email.toLowerCase()
        );

    if (emailExists) {

        alert(
            "The email exists, but the selected account type does not match the account."
        );

    } else {

        alert(
            "No account was found with this email address."
        );
    }

    return;
}


/* -----------------------------------------
   CHECK PASSWORD
   ----------------------------------------- */

if (

    account.password !==
    password
) {

    alert(
        "Incorrect password."
    );

    return;
}

            /*
             * The prototype stores the active user's
             * email in localStorage so dashboard.js
             * can identify the logged-in account.
             */

            localStorage.setItem(
                CURRENT_USER_KEY,
                account.email
            );

/* -----------------------------------------
   SET LOGIN STATUS
----------------------------------------- */

localStorage.setItem(
    "isLoggedIn",
    "true"
);
            /*
             * Remember-me is represented as a
             * simple preference for this prototype.
             */

            localStorage.setItem(
                "rememberMe",
                rememberMe
                    ? "true"
                    : "false"
            );


            window.location.href =
                "dashboard.html";

        }
    );
}


/* =========================================================
   REGISTRATION
   ========================================================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const firstName =
                document.getElementById(
                    "firstName"
                )?.value.trim();


            const lastName =
                document.getElementById(
                    "lastName"
                )?.value.trim();


            const email =
                document.getElementById(
                    "email"
                )?.value.trim();


            const phone =
                document.getElementById(
                    "phone"
                )?.value.trim();


            const role =
                document.getElementById(
                    "role"
                )?.value;


            const password =
                document.getElementById(
                    "password"
                )?.value;


            const confirmPasswordValue =
                document.getElementById(
                    "confirmPassword"
                )?.value;


            const agreeTerms =
                document.getElementById(
                    "agreeTerms"
                )?.checked;


            /* -----------------------------------------
               BASIC VALIDATION
               ----------------------------------------- */

            if (
                !firstName ||
                !lastName ||
                !email ||
                !phone ||
                !role ||
                !password ||
                !confirmPasswordValue
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;
            }


            /* -----------------------------------------
               EMAIL VALIDATION
               ----------------------------------------- */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;
            }


            /* -----------------------------------------
               PASSWORD VALIDATION
               ----------------------------------------- */

            if (
                !isStrongPassword(
                    password
                )
            ) {

                alert(
                    "Your password does not meet all the required conditions."
                );

                return;
            }


            /* -----------------------------------------
               PASSWORD MATCH
               ----------------------------------------- */

            if (
                password !==
                confirmPasswordValue
            ) {

                alert(
                    "The passwords do not match."
                );

                return;
            }


            /* -----------------------------------------
               TERMS
               ----------------------------------------- */

            if (!agreeTerms) {

                alert(
                    "Please agree to the terms before creating your account."
                );

                return;
            }


            /* -----------------------------------------
               GET EXISTING ACCOUNTS
               ----------------------------------------- */

            const accounts =
                getAccounts();


            /* -----------------------------------------
               CHECK DUPLICATE EMAIL
               ----------------------------------------- */

            const existingAccount =
                accounts.find(
                    account =>
                        String(
                            account.email
                        ).toLowerCase() ===
                        email.toLowerCase()
                );


            if (existingAccount) {

                alert(
                    "An account with this email address already exists."
                );

                return;
            }

            
/* ==========================================
   COLLECT SECURITY QUESTIONS
========================================== */

const securityQuestion =
    document.getElementById(
        "securityQuestion"
    )?.value;

const securityAnswer =
    document.getElementById(
        "securityAnswer"
    )?.value.trim();

const securityQuestion2 =
    document.getElementById(
        "securityQuestion2"
    )?.value || "";

const securityAnswer2 =
    document.getElementById(
        "securityAnswer2"
    )?.value.trim() || "";

const securityQuestion3 =
    document.getElementById(
        "securityQuestion3"
    )?.value || "";

const securityAnswer3 =
    document.getElementById(
        "securityAnswer3"
    )?.value.trim() || "";


/* ==========================================
   VALIDATE QUESTIONS AND ANSWERS
========================================== */

if (!securityQuestion || !securityAnswer) {

    alert(
        "Please answer the first security question."
    );

    return;
}

if (
    (securityQuestion2 && !securityAnswer2) ||
    (!securityQuestion2 && securityAnswer2)
) {

    alert(
        "Please select Question 2 and provide its answer, or leave both fields empty."
    );

    return;
}

if (
    (securityQuestion3 && !securityAnswer3) ||
    (!securityQuestion3 && securityAnswer3)
) {

    alert(
        "Please select Question 3 and provide its answer, or leave both fields empty."
    );

    return;
}


/* ==========================================
   PREVENT DUPLICATE QUESTIONS
========================================== */

const selectedQuestions = [
    securityQuestion,
    securityQuestion2,
    securityQuestion3
].filter(Boolean);

if (
    new Set(selectedQuestions).size !==
    selectedQuestions.length
) {

    alert(
        "Please choose a different question for each security question."
    );

    return;
}


/* ==========================================
   SAVE ACCOUNT
   Keep legacy fields for compatibility
========================================== */

const securityQuestions = [
    {
        question: securityQuestion,
        answer: securityAnswer.toLowerCase()
    }
];

if (securityQuestion2) {

    securityQuestions.push({
        question: securityQuestion2,
        answer: securityAnswer2.toLowerCase()
    });

}

if (securityQuestion3) {

    securityQuestions.push({
        question: securityQuestion3,
        answer: securityAnswer3.toLowerCase()
    });

}

const newAccount = {

    firstName,
    lastName,
    email,
    phone,
    role,
    password,

    /* Existing fields retained for compatibility */

    securityQuestion,
    securityAnswer: securityAnswer.toLowerCase(),

    /* All selected questions */

    securityQuestions

};



            /* =================================================
               STUDENT DETAILS
               ================================================= */

            if (role === "student") {

                newAccount.faculty =
                    document.getElementById(
                        "faculty"
                    )?.value.trim() || "";


                newAccount.department =
                    document.getElementById(
                        "department"
                    )?.value.trim() || "";


                newAccount.matricNumber =
                    document.getElementById(
                        "matricNumber"
                    )?.value.trim() || "";


                newAccount.level =
                    document.getElementById(
                        "level"
                    )?.value.trim() || "";
            }


            /* =================================================
               ACADEMIC STAFF DETAILS
               ================================================= */

            if (role === "academicStaff") {

                newAccount.academicFaculty =
                    document.getElementById(
                        "academicFaculty"
                    )?.value.trim() || "";


                newAccount.academicDepartment =
                    document.getElementById(
                        "academicDepartment"
                    )?.value.trim() || "";


                newAccount.academicStaffId =
                    document.getElementById(
                        "academicStaffId"
                    )?.value.trim() || "";


                newAccount.academicPosition =
                    document.getElementById(
                        "academicPosition"
                    )?.value.trim() || "";
            }


            /* =================================================
               NON-ACADEMIC STAFF DETAILS
               ================================================= */

            if (role === "nonAcademicStaff") {

                newAccount.staffUnit =
                    document.getElementById(
                        "staffUnit"
                    )?.value.trim() || "";


                newAccount.nonAcademicStaffId =
                    document.getElementById(
                        "nonAcademicStaffId"
                    )?.value.trim() || "";


                newAccount.staffPosition =
                    document.getElementById(
                        "staffPosition"
                    )?.value.trim() || "";
            }


            /* =================================================
               SECURITY DETAILS
               ================================================= */

            if (role === "security") {

                newAccount.securityId =
                    document.getElementById(
                        "securityId"
                    )?.value.trim() || "";


                newAccount.securityUnit =
                    document.getElementById(
                        "securityUnit"
                    )?.value.trim() || "";


                newAccount.securityPost =
                    document.getElementById(
                        "securityPost"
                    )?.value.trim() || "";
            }


            /* =================================================
               VISITOR DETAILS
               ================================================= */

            if (role === "visitor") {

                newAccount.organization =
                    document.getElementById(
                        "organization"
                    )?.value.trim() || "";


                newAccount.visitPurpose =
                    document.getElementById(
                        "visitPurpose"
                    )?.value.trim() || "";


                newAccount.hostName =
                    document.getElementById(
                        "hostName"
                    )?.value.trim() || "";
            }


            /* -----------------------------------------
               SAVE ACCOUNT
               ----------------------------------------- */

            accounts.push(
                newAccount
            );


            saveAccounts(
                accounts
            );


            /*
             * Automatically log the new user in.
             */

            localStorage.setItem(
                CURRENT_USER_KEY,
                newAccount.email
            );


            alert(
                "Account created successfully. Welcome to CampusSafe!"
            );


            window.location.href =
                "dashboard.html";

        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem(
                CURRENT_USER_KEY
            );


            window.location.href =
                "login.html";

        }
    );
}


/* =========================================================
   SWITCH ACCOUNT
   ========================================================= */

const switchAccountBtn =
    document.getElementById(
        "switchAccountBtn"
    );


if (switchAccountBtn) {

    switchAccountBtn.addEventListener(
        "click",
        function () {

            const confirmSwitch =
                confirm(
                    "Do you want to switch to another account?"
                );


            if (!confirmSwitch) {
                return;
            }


            localStorage.removeItem(
                CURRENT_USER_KEY
            );


            window.location.href =
                "login.html";

        }
    );
}




/* ==========================================
   FORGOT PASSWORD - MULTIPLE SECURITY QUESTIONS
========================================== */

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const verifyEmailBtn =
    document.getElementById("verifyEmailBtn");

const verifyAnswerBtn =
    document.getElementById("verifyAnswerBtn");

const securityVerificationSection =
    document.getElementById("securityVerificationSection");

const newPasswordSection =
    document.getElementById("newPasswordSection");

const recoveryQuestion =
    document.getElementById("recoveryQuestion");

const recoveryAnswer =
    document.getElementById("recoveryAnswer");

let recoveryAccountEmail = null;
let recoveryVerified = false;


/* ==========================================
   SECURITY QUESTION TEXT
========================================== */

function getSecurityQuestionText(question) {

    const questions = {
        firstSchool:
            "What is the name of your first school?",

        birthCity:
            "In which city were you born?",

        childhoodFriend:
            "What is the name of your childhood best friend?",

        favoriteTeacher:
            "What is the name of your favourite teacher?",

        favoriteFood:
            "What is your favourite food?"
    };

    return questions[question] || question || "";
}


/* ==========================================
   GET QUESTIONS FOR AN ACCOUNT
   SUPPORTS NEW AND OLD ACCOUNTS
========================================== */

function getAccountSecurityQuestions(account) {

    if (
        Array.isArray(account.securityQuestions) &&
        account.securityQuestions.length > 0
    ) {
        return account.securityQuestions.filter(item =>
            item &&
            item.question &&
            item.answer
        );
    }

    // Compatibility with older accounts
    if (
        account.securityQuestion &&
        account.securityAnswer
    ) {
        return [
            {
                question: account.securityQuestion,
                answer: account.securityAnswer
            }
        ];
    }

    return [];
}


/* ==========================================
   VERIFY REGISTERED EMAIL
========================================== */

if (verifyEmailBtn) {

    verifyEmailBtn.addEventListener("click", function() {

        const email =
            document.getElementById("resetEmail")
                ?.value.trim().toLowerCase();

        if (!email) {
            alert("Please enter your registered email address.");
            return;
        }

        const accounts = getAccounts();

        const account = accounts.find(user =>
            String(user.email || "")
                .trim()
                .toLowerCase() === email
        );

        if (!account) {
            alert("No account was found with this email address.");
            return;
        }

        const questions =
            getAccountSecurityQuestions(account);

        if (questions.length === 0) {
            alert(
                "This account has no security question registered. " +
                "Please contact the system administrator for account recovery."
            );
            return;
        }

        if (
            !recoveryQuestion ||
            !recoveryAnswer ||
            !securityVerificationSection ||
            !newPasswordSection
        ) {
            alert(
                "A required recovery HTML element is missing. " +
                "Please check your forgot-password.html file."
            );
            return;
        }

        recoveryAccountEmail = email;
        recoveryVerified = false;

        // Clear previous questions
        recoveryQuestion.innerHTML = "";

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent =
            "Choose a security question";

        recoveryQuestion.appendChild(defaultOption);

        // Display all questions registered by this account
        questions.forEach((item, index) => {

            const option =
                document.createElement("option");

            option.value = String(index);

            option.textContent =
                getSecurityQuestionText(item.question);

            recoveryQuestion.appendChild(option);

        });

        recoveryQuestion.value = "";
        recoveryAnswer.value = "";

        securityVerificationSection.style.display = "block";
        newPasswordSection.style.display = "none";

        alert(
            "Your security questions have been loaded. " +
            "Choose one question and enter its correct answer."
        );

    });

}


/* ==========================================
   VERIFY SELECTED SECURITY ANSWER
========================================== */

if (verifyAnswerBtn) {

    verifyAnswerBtn.addEventListener("click", function() {

        const email =
            document.getElementById("resetEmail")
                ?.value.trim().toLowerCase();

        if (
            !recoveryAccountEmail ||
            email !== recoveryAccountEmail
        ) {
            alert(
                "Please verify your registered email address again."
            );

            if (securityVerificationSection) {
                securityVerificationSection.style.display = "none";
            }

            if (newPasswordSection) {
                newPasswordSection.style.display = "none";
            }

            recoveryVerified = false;
            return;
        }

        const accounts = getAccounts();

        const account = accounts.find(user =>
            String(user.email || "")
                .trim()
                .toLowerCase() === recoveryAccountEmail
        );

        if (!account) {
            alert("Account not found. Please start again.");
            return;
        }

        if (!recoveryQuestion.value) {
            alert("Please choose a security question.");
            return;
        }

        const questions =
            getAccountSecurityQuestions(account);

        const selectedIndex =
            Number(recoveryQuestion.value);

        const selectedQuestion =
            questions[selectedIndex];

        if (!selectedQuestion) {
            alert(
                "The selected security question could not be found. " +
                "Please verify your email again."
            );
            return;
        }

        const submittedAnswer =
            recoveryAnswer.value.trim().toLowerCase();

        const savedAnswer =
            String(selectedQuestion.answer)
                .trim()
                .toLowerCase();

        if (
            !submittedAnswer ||
            submittedAnswer !== savedAnswer
        ) {
            recoveryVerified = false;

            if (newPasswordSection) {
                newPasswordSection.style.display = "none";
            }

            alert(
                "Incorrect security answer. " +
                "Please try again."
            );

            return;
        }

        recoveryVerified = true;

        newPasswordSection.style.display = "block";

        alert(
            "Security answer verified. " +
            "You may now change your password."
        );

    });

}



/* -----------------------------------------
   RESET PASSWORD AFTER VERIFICATION
----------------------------------------- */

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            if (!recoveryVerified || !recoveryAccountEmail) {

                alert(
                    "Please verify your security answer before resetting your password."
                );

                return;
            }

            const email =
                document.getElementById(
                    "resetEmail"
                )?.value.trim().toLowerCase();

            if (email !== recoveryAccountEmail) {

                alert(
                    "The email address has changed. Please verify your account again."
                );

                recoveryVerified = false;

                newPasswordSection.style.display =
                    "none";

                return;
            }

            const newPassword =
                document.getElementById(
                    "newPassword"
                )?.value;

            const confirmNewPassword =
                document.getElementById(
                    "confirmNewPassword"
                )?.value;

            if (
                !newPassword ||
                !confirmNewPassword
            ) {

                alert(
                    "Please enter and confirm your new password."
                );

                return;
            }

            if (!isStrongPassword(newPassword)) {

                alert(
                    "Your new password does not meet all password requirements."
                );

                return;
            }

            if (newPassword !== confirmNewPassword) {

                alert(
                    "The passwords do not match."
                );

                return;
            }

            const accounts = getAccounts();

            const accountIndex = accounts.findIndex(
                user =>
                    String(
                        user.email || ""
                    ).trim().toLowerCase() ===
                    recoveryAccountEmail
            );

            if (accountIndex === -1) {

                alert(
                    "Account not found. Please start again."
                );

                return;
            }

            accounts[accountIndex].password =
                newPassword;

            saveAccounts(accounts);

            recoveryVerified = false;
            recoveryAccountEmail = null;

            alert(
                "Password reset successfully. You can now log in."
            );

            window.location.href = "login.html";

        }
    );

}

/* =========================================================
   INITIAL PASSWORD REQUIREMENT STATE
   ========================================================= */

if (registerPassword) {

    updatePasswordRequirements(
    
    
        registerPassword.value,
        "register"
    );
}


if (resetPassword) {

    updatePasswordRequirements(
        resetPassword.value,
        ""
    );
}


if (editPassword) {

    updatePasswordRequirements(
        editPassword.value,
        "edit"
    );
}

/* =========================================================
   SHOW / HIDE FORGOT PASSWORD SECURITY ANSWER
========================================================= */

const recoveryAnswerInput =
    document.getElementById("recoveryAnswer");

const toggleRecoveryAnswer =
    document.getElementById("toggleSecurityAnswer");

if (
    recoveryAnswerInput &&
    toggleRecoveryAnswer
) {

    toggleRecoveryAnswer.addEventListener(
        "click",
        function () {

            if (
                recoveryAnswerInput.type === "password"
            ) {

                recoveryAnswerInput.type = "text";

                toggleRecoveryAnswer.textContent =
                    "Hide";

            } else {

                recoveryAnswerInput.type = "password";

                toggleRecoveryAnswer.textContent =
                    "Show";

            }

        }
    );

}
