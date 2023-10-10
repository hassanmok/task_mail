document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function email_view(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#message').style.display = 'block';
    document.querySelector('#message').innerHTML = `
      <div style="margin-top: 3%;
      margin-bottom: 3%;">
      <h5><strong>From: </strong>${email.sender}</h5>
      <h5><strong>To: </strong>${email.recipients}</h5>
      <h5><strong>Subject: </strong>${email.subject}</h5>
      <h5><strong>Timestemp: </strong>${email.timestamp}</h5>
      </div>
      <hr>
      <h5>${email.body}</h5>`;
      if(email.read == false)
      {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      const button_of_reply = document.createElement('button');
      button_of_reply.innerHTML = 'Reply';
      button_of_reply.className = 'btn btn-success';
      button_of_reply.addEventListener('click', function() {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let sub = email.subject;
        if(sub.split('',1)[0] != "Re:"){
          sub = "Re: " + email.subject;
        }
        document.querySelector('#compose-subject').value = sub;
        document.querySelector('#compose-body').value = `on ${email.timestamp} ${email.sender} wrote: ${email.body}`;

      });
      document.querySelector('#message').append(button_of_reply);


      const button_of_arch = document.createElement('button');
      button_of_arch.innerHTML = email.archived ? 'Unarchived' : 'Archived';
      button_of_arch.className = email.archived ? 'btn btn-danger' : 'btn btn-success';
      button_of_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .than(() => {
          load_mailbox('archived');
        })
      });
      document.querySelector('#message').append(button_of_arch);
});
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(eachEmail => {
      console.log(eachEmail);
      const email = document.createElement('div');
      email.innerHTML = `<div style="border: 2px solid black;">
      <h5 style= " display: flex;
      justify-content: space-between;"> <span><strong>${eachEmail.sender}</strong> &nbsp; ${eachEmail.subject} </span> <span style="color: gray;">${eachEmail.timestamp}</span></h5>
      </div>
      `;

    // `<div class="card" style="width: 18rem;">
    //   <div class="card-body">
    //     <h5 class="card-title">Sender: ${eachEmail.sender}</h5>
    //     <h5 class="card-subtitle mb-2 text-muted">Subject: ${eachEmail.subject}</h5>
    //     <p class="card-text">${eachEmail.timestamp}</p>
    //   </div>
    // </div> 
    // <br>`
      email.className = eachEmail.read ? 'read': 'not_readed';
      email.addEventListener('click', function (){
        email_view(eachEmail.id)
      });
      document.querySelector('#emails-view').append(email);
  })
});
}

function send_email(event){
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}