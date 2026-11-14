import html
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from backend.app.core.config import settings


def send_email(subject: str, text_content: str, html_content: Optional[str] = None, to_email: Optional[str] = None) -> bool:
    """
    Send an email using configured SMTP credentials.
    Gracefully returns False if SMTP is unconfigured or if an error occurs.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASS:
        # SMTP not configured; log and continue gracefully
        return False

    recipient = to_email or settings.CONTACT_TO_EMAIL
    if not recipient:
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f'"{settings.BRAND_NAME}" <{settings.SMTP_USER}>'
        msg["To"] = recipient

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        if html_content:
            msg.attach(MIMEText(html_content, "html", "utf-8"))

        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            server.starttls()

        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_USER, [recipient], msg.as_string())
        server.quit()
        return True
    except Exception as exc:
        print(f"[Email Error] Could not send email: {exc}")
        return False


def send_contact_email(name: str, email: str, phone: Optional[str], message: str) -> bool:
    subject = f"Ujumbe mpya kutoka kwa {name} - {settings.BRAND_NAME}"
    safe_name = html.escape(name)
    safe_email = html.escape(email)
    safe_phone = html.escape(phone or "Haikutolewa")
    safe_message = html.escape(message).replace("\n", "<br/>")

    text = f"Jina: {name}\nBarua pepe: {email}\nSimu: {phone or 'Haikutolewa'}\n\nUjumbe:\n{message}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #2B2320;">
      <h2 style="color: #3B1F2B; border-bottom: 2px solid #B08D57; padding-bottom: 8px;">Ujumbe Mpya wa Tovuti</h2>
      <p><strong>Jina:</strong> {safe_name}</p>
      <p><strong>Barua pepe:</strong> {safe_email}</p>
      <p><strong>Simu:</strong> {safe_phone}</p>
      <p><strong>Ujumbe:</strong></p>
      <div style="background-color: #FBF6F1; padding: 12px; border-radius: 8px; border-left: 4px solid #3B1F2B;">
        {safe_message}
      </div>
    </div>
    """
    return send_email(subject, text, html_body)


def send_order_email(order_ref: str, name: str, phone: str, address: str, items_summary: str, subtotal: float, delivery_fee: float, total: float, items_html: str) -> bool:
    subject = f"Order {order_ref} kutoka kwa {name} - TZS {total:,.0f}"
    text = (
        f"Namba ya Order: {order_ref}\n"
        f"Jina: {name}\n"
        f"Simu: {phone}\n"
        f"Anuani: {address}\n\n"
        f"Bidhaa:\n{items_summary}\n\n"
        f"Jumla ya Bidhaa: TZS {subtotal:,.0f}\n"
        f"Delivery: TZS {delivery_fee:,.0f}\n"
        f"Jumla Kuu: TZS {total:,.0f}"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #2B2320;">
      <h2 style="color: #3B1F2B; border-bottom: 2px solid #B08D57; padding-bottom: 8px;">Order Mpya: {order_ref}</h2>
      <p><strong>Jina:</strong> {html.escape(name)}</p>
      <p><strong>Simu:</strong> {html.escape(phone)}</p>
      <p><strong>Anuani:</strong> {html.escape(address)}</p>
      <h3 style="color: #3B1F2B;">Bidhaa Zilizoagizwa:</h3>
      <ul>{items_html}</ul>
      <p><strong>Jumla ya Bidhaa:</strong> TZS {subtotal:,.0f}</p>
      <p><strong>Delivery:</strong> TZS {delivery_fee:,.0f}</p>
      <p style="font-size: 16px; font-weight: bold; color: #3B1F2B;">Jumla Kuu: TZS {total:,.0f}</p>
    </div>
    """
    return send_email(subject, text, html_body)


def send_review_email(name: str, rating: int, message: str) -> bool:
    stars = "★" * rating + "☆" * (5 - rating)
    subject = f"Maoni mapya kutoka kwa {name} ({stars}) - {settings.BRAND_NAME}"
    safe_name = html.escape(name)
    safe_message = html.escape(message).replace("\n", "<br/>")

    text = f"Jina: {name}\nNyota: {stars}\n\nUjumbe:\n{message}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #2B2320;">
      <h2 style="color: #3B1F2B; border-bottom: 2px solid #B08D57; padding-bottom: 8px;">Maoni Mapya ya Mteja</h2>
      <p><strong>Jina:</strong> {safe_name}</p>
      <p><strong>Kiwango:</strong> <span style="color: #B08D57; font-size: 18px;">{stars}</span></p>
      <p><strong>Ujumbe:</strong></p>
      <div style="background-color: #FBF6F1; padding: 12px; border-radius: 8px;">
        {safe_message}
      </div>
    </div>
    """
    return send_email(subject, text, html_body)
