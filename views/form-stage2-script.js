'use strict';

const workingStatusSelect = document.getElementById('workingStatus');
const val = workingStatusSelect.value;
const companyStuff = document.getElementById('companyStuff');
companyStuff.style.display = val === 'employed' ? 'block' : 'none';

workingStatusSelect.addEventListener('change', event => {
  const status = event.target.value;
  if (status === 'employed') companyStuff.style.display = 'block';
  else {
    companyStuff.style.display = 'none';
    Array.from(companyStuff.children).forEach(val => {
      val.children[1].value = 'none';
    });
  }
});
