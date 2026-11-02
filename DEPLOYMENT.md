# Production deployment

The site remains static, with one server-side endpoint at `api/request-appointment.js`. Deploy it on Vercel (or adapt the function to the chosen serverless platform); the appointment form does not send email directly from the browser.

Configure these environment variables in the production deployment:

- `RESEND_API_KEY`: a server-only Resend API key with permission to send email.
- `RESEND_FROM_EMAIL`: a sender address on a domain verified with Resend.
- `SITE_ORIGIN`: the exact public origin, such as `https://clinic.example` (no path or trailing slash is required).

The endpoint sends only the patient's name, phone number, selected hospital, requested date, and clinic window to `bilal.smm007@gmail.com`. It does not collect or email a medical history. The form submission is only a request; clinic staff must confirm the appointment separately. The endpoint validates the clinic's weekly schedule and date on the server, checks the same-site origin, limits request size, and uses a honeypot field for basic bot filtering.

The production hostname was not provided, so absolute canonical URLs are intentionally not set. Add the correct canonical URL to each page once the final public domain is known.

Before launch, add the production environment variables, deploy to the configured origin, submit a test request with clinic approval, and verify that the message arrives in the recipient inbox. Email delivery has not been testable from this source checkout because no production credentials or verified sender domain are available here. Do not describe online booking as live until that delivery test succeeds.
