const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

function showError(field, message) {
  const box = field.closest('.form-field');
  const error = box && box.querySelector('.error-msg');
  field.classList.toggle('invalid', !!message);
  if (error) error.textContent = message;
}

function checkField(field, pattern, message) {
  const valid = pattern.test(field.value.trim());
  showError(field, valid ? '' : message);
  field.valid = valid;
  return valid;
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  const rules = {
    fullName: [/^[a-zA-Z\s]{2,50}$/, 'Use 2–50 letters and spaces.'],
    empId: [/^[A-Z0-9]{6,12}$/i, 'Use 6–12 letters or numbers.'],
    regEmail: [emailPattern, 'Enter a valid email address.'],
    mobile: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'],
    dept: [/.+/, 'Please select a division.'],
    regPassword: [passwordPattern, 'Use 8+ characters with uppercase, lowercase, number and symbol.']
  };
  const confirm = document.getElementById('confirmPassword');
  const password = document.getElementById('regPassword');
  const submit = document.getElementById('registerSubmit');

  function checkConfirm() {
    const valid = confirm.value !== '' && confirm.value === password.value;
    showError(confirm, valid ? '' : 'Passwords do not match.');
    confirm.valid = valid;
    return valid;
  }

  function updateButton() {
    submit.disabled = !Object.keys(rules).every(id => document.getElementById(id).valid === true && confirm.valid === true);
  }

  Object.keys(rules).forEach(function (id) {
    const field = document.getElementById(id);
    function validate() {
      checkField(field, rules[id][0], rules[id][1]);
      if (id === 'regPassword' || id === 'confirmPassword') checkConfirm();
      updateButton();
    }
    field.addEventListener('blur', validate);
    field.addEventListener('input', validate);
    field.addEventListener('change', validate);
  });
  confirm.addEventListener('blur', function () { checkConfirm(); updateButton(); });
  confirm.addEventListener('input', function () { checkConfirm(); updateButton(); });

  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    let valid = true;
    Object.keys(rules).forEach(id => {
      if (!checkField(document.getElementById(id), rules[id][0], rules[id][1])) valid = false;
    });
    if (!checkConfirm()) valid = false;
    updateButton();
    const alertBox = document.getElementById('registerAlert');
    alertBox.className = valid ? 'form-alert' : 'form-alert error';
    alertBox.textContent = valid ? 'All fields are valid. This is a demonstration form.' : 'Please correct the highlighted fields.';
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  const email = document.getElementById('signupEmail');
  const password = document.getElementById('signupPassword');
  const terms = document.getElementById('terms');
  const submit = document.getElementById('signupSubmit');

  function checkSignup() {
    const emailOK = checkField(email, emailPattern, 'Enter a valid email address.');
    const passwordOK = checkField(password, passwordPattern, 'Use uppercase, lowercase, number, symbol and 8+ characters.');
    document.getElementById('termsError').textContent = terms.checked ? '' : 'Please accept the Terms of Service.';
    submit.disabled = !(emailOK && passwordOK && terms.checked);
    return emailOK && passwordOK && terms.checked;
  }
  [email, password].forEach(field => {
    field.addEventListener('blur', checkSignup);
    field.addEventListener('input', checkSignup);
  });
  terms.addEventListener('change', checkSignup);
  signupForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const valid = checkSignup();
    const alertBox = document.getElementById('signupAlert');
    alertBox.className = valid ? 'form-alert' : 'form-alert error';
    alertBox.textContent = valid ? 'Form is valid. Real account creation needs a server.' : 'Please complete the form correctly.';
  });
}

const signinForm = document.getElementById('signinForm');
if (signinForm) {
  const email = document.getElementById('signinEmail');
  const password = document.getElementById('signinPassword');
  document.getElementById('showPassword').addEventListener('click', function () {
    password.type = password.type === 'password' ? 'text' : 'password';
    this.setAttribute('aria-label', password.type === 'password' ? 'Show password' : 'Hide password');
  });
  signinForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const emailOK = checkField(email, emailPattern, 'Enter a valid email address.');
    const passwordOK = password.value.length >= 8;
    showError(password, passwordOK ? '' : 'Enter at least 8 characters.');
    const alertBox = document.getElementById('signinAlert');
    alertBox.className = emailOK && passwordOK ? 'form-alert' : 'form-alert error';
    alertBox.textContent = emailOK && passwordOK ? 'Input format is valid. This demo does not check real accounts.' : 'Check your email and password format.';
  });
}
