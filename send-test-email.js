const fetch = require('node-fetch');

async function sendTestEmail() {
  try {
    const response = await fetch('http://localhost:3000/api/assessment/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessment_id: '6b084cfe-5df7-4eae-83b7-4c88b93f4eab',
        recipient_email: 'Tcrowley128@gmail.com'
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

sendTestEmail();
