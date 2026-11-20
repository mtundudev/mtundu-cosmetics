import html
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


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


def send_order_email(
    order_ref: str,
    name: str,
    phone: str,
    address: str,
    customer_email: Optional[str],
    items: list[dict[str, Any]],
    subtotal: float,
    delivery_fee: float,
    total: float,
) -> bool:
    subject = f"Order mpya {order_ref} - TZS {total:,.0f}"
    item_text_lines = []
    item_html_rows = []
    for index, item in enumerate(items, start=1):
        item_name = str(item["name"])
        quantity = int(item["quantity"])
        unit_price = float(item["priceValue"])
        original_price = float(item.get("originalPriceValue", unit_price))
        discount_percent = int(item.get("discountPercent", 0))
        line_total = unit_price * quantity
        item_text_lines.append(
            f"{index}. {item_name} | {quantity} x TZS {unit_price:,.0f}"
            f"{f' (was TZS {original_price:,.0f}, -{discount_percent}%)' if discount_percent else ''}"
            f" = TZS {line_total:,.0f}"
        )
        price_html = f"TZS {unit_price:,.0f}"
        if discount_percent:
            price_html += (
                f'<br><span style="font-size:11px;color:#7A6570;text-decoration:line-through;">'
                f"TZS {original_price:,.0f}</span>"
            )
        row_color = "#FFF9FB" if index % 2 else "#F8F1F4"
        item_html_rows.append(
            f"""
            <tr style="background-color:{row_color};">
              <td style="padding:12px 10px;border-bottom:1px solid #EADDE3;color:#35232D;">{html.escape(item_name)}</td>
              <td style="padding:12px 10px;border-bottom:1px solid #EADDE3;text-align:center;color:#5A4650;">{quantity}</td>
              <td style="padding:12px 10px;border-bottom:1px solid #EADDE3;text-align:right;white-space:nowrap;color:#5A4650;">{price_html}</td>
              <td style="padding:12px 10px;border-bottom:1px solid #EADDE3;text-align:right;white-space:nowrap;font-weight:bold;color:#3B1F2B;">TZS {line_total:,.0f}</td>
            </tr>
            """
        )
    items_text = "\n".join(item_text_lines)
    safe_order_ref = html.escape(order_ref)
    safe_name = html.escape(name)
    safe_phone = html.escape(phone)
    safe_address = html.escape(address)
    safe_customer_email = html.escape(customer_email or "Haikutolewa")
    text = (
        f"ORDER MPYA: {order_ref}\n\n"
        f"Jina: {name}\n"
        f"Simu: {phone}\n"
        f"Anuani: {address}\n"
        f"Barua pepe: {customer_email or 'Haikutolewa'}\n\n"
        f"Bidhaa:\n{items_text}\n\n"
        f"Jumla ya Bidhaa: TZS {subtotal:,.0f}\n"
        f"Uwasilishaji: TZS {delivery_fee:,.0f}\n"
        f"Jumla Kuu: TZS {total:,.0f}"
    )
    html_body = f"""
    <div style="margin:0;padding:24px;background-color:#FBF6F1;font-family:Arial,Helvetica,sans-serif;color:#35232D;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;background:#FFFFFF;border:1px solid #EADDE3;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:22px 24px;background-color:#3B1F2B;color:#FBF6F1;border-bottom:4px solid #B08D57;">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#E8C6CC;">{html.escape(settings.BRAND_NAME)}</div>
            <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#FFFFFF;">Oda Mpya Imepokelewa</h1>
            <div style="margin-top:8px;font-size:14px;color:#F1DDE5;">Namba ya oda: <strong>{safe_order_ref}</strong></div>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 24px 10px;">
            <h2 style="margin:0 0 12px;font-size:16px;color:#3B1F2B;">Taarifa za mteja</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:6px 0;color:#7A6570;">Jina</td><td style="padding:6px 0;text-align:right;font-weight:bold;">{safe_name}</td></tr>
              <tr><td style="padding:6px 0;color:#7A6570;">Simu</td><td style="padding:6px 0;text-align:right;">{safe_phone}</td></tr>
              <tr><td style="padding:6px 0;color:#7A6570;">Anuani</td><td style="padding:6px 0;text-align:right;">{safe_address}</td></tr>
              <tr><td style="padding:6px 0;color:#7A6570;">Barua pepe</td><td style="padding:6px 0;text-align:right;">{safe_customer_email}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 24px 18px;">
            <h2 style="margin:0 0 12px;font-size:16px;color:#3B1F2B;">Bidhaa zilizoagizwa</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background-color:#F0E3E9;color:#3B1F2B;text-align:left;">
                  <th style="padding:11px 10px;">Bidhaa</th>
                  <th style="padding:11px 10px;text-align:center;">Idadi</th>
                  <th style="padding:11px 10px;text-align:right;">Bei</th>
                  <th style="padding:11px 10px;text-align:right;">Jumla</th>
                </tr>
              </thead>
              <tbody>{''.join(item_html_rows)}</tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:7px 0;color:#7A6570;">Jumla ya bidhaa</td><td style="padding:7px 0;text-align:right;">TZS {subtotal:,.0f}</td></tr>
              <tr><td style="padding:7px 0;color:#7A6570;">Uwasilishaji</td><td style="padding:7px 0;text-align:right;">TZS {delivery_fee:,.0f}</td></tr>
              <tr><td colspan="2" style="padding-top:10px;border-top:2px solid #E8C6CC;"></td></tr>
              <tr><td style="padding:8px 0;font-size:17px;font-weight:bold;color:#3B1F2B;">Jumla kuu</td><td style="padding:8px 0;text-align:right;font-size:18px;font-weight:bold;color:#9C4F63;">TZS {total:,.0f}</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    """
    recipient = settings.ORDER_NOTIFICATION_EMAIL.strip() or settings.CONTACT_TO_EMAIL
    return send_email(subject, text, html_body, to_email=recipient)


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
