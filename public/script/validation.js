const name = document.getElementById('name')
const email = document.getElementById('email')
const number = document.getElementById('number')
const password = document.getElementById('passwoird')
const form = document.getElementById('from');

//error massege
const nameError = document.getElementById('nameError')
const emailError= document.getElementById('emailError')
const numberError= document.getElementById('numberError')
const passwordError= document.getElementById('passwordError');

form.addEventListener('submit',(e)=>{

    //name validation
    if(name.value === '' || name.value === null){
        e.preventDefault();
        nameError.innerHTML = 'Name is required';
       
    }
    //email verification 
     if(email.value === '' || email.value === null){
        emailError.innerHTML = 'email is required';
        e.preventDefault();
    }
    //numberverification
    if(number.value === '' || number.value === null || number.value< 10){
        numberError.innerHTML = 'Number must be at least 10';
        e.preventDefault();
    }

    //password Validations
    if(password.value === '' || password.value === null){
        passwordError.innerHTML = 'password is required';
        e.preventDefault();
    }
    
})
