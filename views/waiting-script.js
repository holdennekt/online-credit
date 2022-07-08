'use strict';

const bounceAnim = document.getElementsByClassName('bounce-anim')[0];
const answerDiv = document.getElementsByClassName('answer-container')[0];
const answer = document.getElementById('answer');
const creditInfo = document.getElementById('credit');
const comment = document.getElementById('comment');

const socket = new WebSocket('ws://localhost:8081');

const documentNumber = localStorage.getItem('documentNumber');

fetch(`http://localhost:8080/api/getId?documentNumber=${documentNumber}`)
  .then(resp => resp.json())
  .then(id => {
    const message = {
      type: 'customer',
      body: { id },
    };
    if (socket.CONNECTING) {
      socket.onopen = () => {
        socket.send(JSON.stringify(message));
      };
    } else socket.send(JSON.stringify(message));
  });

socket.onmessage = mes => {
  const message = JSON.parse(mes.data);
  if (message.type === 'creditAnswer') {
    const confirmed = message.body.answer === 'yes';
    answer.textContent = confirmed ? 'Yes!' : 'No';
    const dollars = localStorage.getItem('moneyAmount');
    const months = localStorage.getItem('monthsNumber');
    const good = `Your ${dollars}$ credit on ${months} months has been confirmed.`;
    const bad = `Sorry, your ${dollars}$ credit on ${months} months has been rejected.`;
    creditInfo.textContent = confirmed ? good : bad;
    comment.textContent = message.body.comment;
    bounceAnim.style.display = 'none';
    answerDiv.style.display = 'block';
  }
};
