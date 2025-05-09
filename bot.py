from telegram import ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
import datetime

# Fungsi untuk memulai dan menampilkan tombol
def start(update, context):
    if update.message.text == "/start kontak":
        keyboard = [[KeyboardButton("Kirim Nomor Saya", request_contact=True)]]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)
        update.message.reply_text("Klik tombol di bawah untuk kirim nomor:", reply_markup=reply_markup)

# Fungsi untuk menangani kontak yang dikirim oleh pengguna
def handle_contact(update, context):
    contact = update.message.contact
    phone_number = contact.phone_number
    first_name = contact.first_name
    last_name = contact.last_name if contact.last_name else ""
    
    # Mendapatkan tanggal dan waktu pengiriman
    now = datetime.datetime.now()
    date_time = now.strftime("%Y-%m-%d %H:%M:%S")
    
    # Membuat file VCF
    vcf = f"BEGIN:VCARD\nVERSION:3.0\nFN:{first_name} {last_name}\nTEL;TYPE=CELL:{phone_number}\n" \
          f"NOTE: Kirim pada {date_time}\nEND:VCARD"
    
    # Mengirim VCF ke pengguna
    file = open("kontak.vcf", "w")
    file.write(vcf)
    file.close()

    # Kirim VCF ke pengguna
    context.bot.send_document(chat_id=update.message.chat_id, document=open("kontak.vcf", "rb"))

    # Memberi pesan konfirmasi
    update.message.reply_text("Kontak kamu telah diterima, dan file VCF sudah dikirim!")

# Fungsi utama untuk menjalankan bot
def main():
    # Gantilah dengan token bot kamu
    updater = Updater("8051593906:AAFeMij6V_XGMcRsL1Jkf5XpP_P3VAKo0Mo", use_context=True)
    dp = updater.dispatcher

    # Menambahkan handler untuk /start dan menerima kontak
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(MessageHandler(Filters.contact, handle_contact))

    # Mulai bot
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()