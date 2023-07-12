function validateform(){
    var name=document.getElementById('pName')

    var error=document.getElementById('error-message')
    
    if(name.value.trim()==null)
  {
  error.innerHTML="fill the fields"
  return false;
  }

  return true;
}