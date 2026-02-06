import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    
    // Only send email when status changes to 'confirmed'
    if (record.status !== 'confirmed') {
      return new Response(JSON.stringify({ message: 'No email sent - status not confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user email and event details
    const { data: booking, error } = await supabaseClient
      .from('bookings')
      .select(`
        user:auth.users(email),
        event:events(title)
      `)
      .eq('id', record.id)
      .single()

    if (error || !booking?.user?.email || !booking?.event?.title) {
      console.error('Missing booking data:', error)
      throw new Error('Missing booking data')
    }

    // Format date and time
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }

    // Send email using Resend (you'll need to add RESEND_API_KEY to secrets)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Great news! Your booking has been confirmed.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Event:</strong> ${booking.event.title}</p>
              <p><strong>Date:</strong> ${formatDate(record.booking_date)}</p>
              <p><strong>Time:</strong> ${formatTime(record.booking_time)}</p>
            </div>
            
            <p>Please arrive 15 minutes before your scheduled time. If you need to make any changes, please contact us.</p>
            
            <p>Thank you for choosing our service!</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Example with Resend (you'll need to add RESEND_API_KEY to secrets)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourapp.com',
        to: booking.user.email,
        subject: 'Booking Confirmed - ' + booking.event.title,
        html: emailHtml
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Email service error:', errorData)
      throw new Error('Failed to send email')
    }

    console.log('Email sent successfully to:', booking.user.email)

    return new Response(JSON.stringify({ 
      message: 'Email sent successfully',
      email: booking.user.email 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error in booking-confirmed function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
