import TcpSocket from 'react-native-tcp-socket';
import {Buffer} from 'buffer';

const ntirpServe = async () => {
  try {
    const options = {
        host: 'nrtk.big.go.id',
        port: 2001,
    };

    const username   = 'xxxxxxx';
    const password   = 'xxxxxxx'; // data bersifat kredensial, hubungi developer
    const mountpoint = 'Nearest-rtcm3';
    const userAgent   = 'NTRIP';
    const gnggaData   = `$GNGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47\r\n`;
    const auth       =  Buffer.from(`${username}:${password}`).toString('base64');
    const requestData =  `GET /${mountpoint} HTTP/1.0\r\nAuthorization: Basic ${auth}\r\nUser-Agent: ${userAgent}\r\n\r\n`;

    const client = TcpSocket.createConnection(options, () => {
      console.log('Connected to NTRIP caster');
      client.write(requestData); // Kirim permintaan awal ke server
    });
    client.on('data', (data) => {
      const string = data.toString(); // Ubah buffer ke string
      console.log('Received Data:', string);
    
      // Jika server sudah siap, kirim data GNGGA
      if (string.indexOf("ICY 200 OK") !== -1) { // Respon sukses NTRIP
        console.log('Sending GNGGA Data...');
        client.write(gnggaData); // Kirim string GNGGA ke server
      }
    
      // Menutup koneksi jika menemukan "ENDSOURCETABLE"
      if (string.indexOf("ENDSOURCETABLE") !== -1) {
        client.destroy(); // Tutup koneksi
      }
    });

  } catch (error) { 
    console.log('error ntir',error);
  }
}

export default ntirpServe;