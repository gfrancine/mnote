import { toHtml } from "../../mnote-util/dom";

export const kanbanIcon = (_fillClass: string, strokeClass: string) =>
  toHtml(`
<svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.999 0L144 0L144 416L17.999 416Q17.5571 416 17.1158 415.978Q16.6745
  415.957 16.2348 415.913Q15.7951 415.87 15.358 415.805Q14.9209 415.74 14.4876 
  415.654Q14.0542 415.568 13.6256 415.461Q13.197 415.353 12.7742 415.225Q12.3513 
  415.097 11.9353 414.948Q11.5193 414.799 11.1111 414.63Q10.7029 414.461 10.3034 
  414.272Q9.90401 414.083 9.51433 413.875Q9.12465 413.666 8.74567 413.439Q8.36668 
  413.212 7.99929 412.967Q7.63191 412.721 7.27701 412.458Q6.92211 412.195 6.58056 
  411.914Q6.239 411.634 5.91161 411.337Q5.58422 411.041 5.27178 410.728Q4.95935 
  410.416 4.66262 410.088Q4.36589 409.761 4.08558 409.419Q3.80528 409.078 3.54207 
  408.723Q3.27886 408.368 3.03338 408.001Q2.7879 407.633 2.56074 407.254Q2.33359 
  406.875 2.1253 406.486Q1.91701 406.096 1.7281 405.696Q1.53918 405.297 1.37009 
  404.889Q1.201 404.481 1.05215 404.065Q0.903293 403.649 0.775031 403.226Q0.646768 
  402.803 0.539407 402.374Q0.432047 401.946 0.345846 401.512Q0.259645 401.079 
  0.194812 400.642Q0.129979 400.205 0.0866701 399.765Q0.0433612 399.326 0.0216806 
  398.884Q0 398.443 0 398.001L0 17.999Q0 17.5571 0.0216806 17.1158Q0.0433612 16.6745
  0.0866701 16.2348Q0.129979 15.7951 0.194812 15.358Q0.259645 14.9209 0.345846 
  14.4876Q0.432047 14.0542 0.539407 13.6256Q0.646768 13.197 0.775031 
  12.7742Q0.903293 12.3513 1.05215 11.9353Q1.201 11.5193 1.37009 11.1111Q1.53918 
  10.7029 1.7281 10.3034Q1.91701 9.90401 2.1253 9.51433Q2.33359 9.12465 2.56074 
  8.74567Q2.7879 8.36668 3.03338 7.99929Q3.27886 7.63191 3.54207 7.27701Q3.80528 
  6.92211 4.08558 6.58056Q4.36589 6.239 4.66262 5.91161Q4.95935 5.58422 5.27178 
  5.27178Q5.58422 4.95935 5.91161 4.66262Q6.239 4.36589 6.58055 4.08558Q6.92211 
  3.80528 7.27701 3.54207Q7.63191 3.27886 7.99929 3.03338Q8.36668 2.7879 8.74566 
  2.56074Q9.12465 2.33359 9.51433 2.1253Q9.90401 1.91701 10.3034 1.7281Q10.7029 
  1.53918 11.1111 1.37009Q11.5193 1.201 11.9353 1.05215Q12.3513 0.903293 12.7742 
  0.775031Q13.197 0.646768 13.6256 0.539407Q14.0542 0.432047 14.4876 
  0.345846Q14.9209 0.259645 15.358 0.194812Q15.7951 0.129979 16.2348 
  0.0866701Q16.6745 0.0433612 17.1158 0.0216806Q17.5571 0 17.999 0Z" 
  transform="translate(32 48)" fill="none" fill-rule="evenodd" class="${strokeClass}"
  stroke-width="32" />
  <path d="M0 0L142.001 0Q142.443 0 142.884 0.0216806Q143.326 0.0433612 143.765 
  0.0866701Q144.205 0.129979 144.642 0.194812Q145.079 0.259645 145.512 
  0.345846Q145.946 0.432047 146.374 0.539407Q146.803 0.646768 147.226 
  0.775031Q147.649 0.903293 148.065 1.05215Q148.481 1.201 148.889 1.37009Q149.297 
  1.53918 149.697 1.7281Q150.096 1.91701 150.486 2.1253Q150.875 2.33359 151.254 
  2.56074Q151.633 2.7879 152.001 3.03338Q152.368 3.27886 152.723 3.54207Q153.078 
  3.80528 153.419 4.08558Q153.761 4.36589 154.088 4.66262Q154.416 4.95935 154.728 
  5.27178Q155.041 5.58422 155.337 5.91161Q155.634 6.239 155.914 6.58055Q156.195 
  6.92211 156.458 7.27701Q156.721 7.63191 156.967 7.99929Q157.212 8.36668 157.439 
  8.74566Q157.666 9.12465 157.875 9.51433Q158.083 9.90401 158.272 10.3034Q158.461 
  10.7029 158.63 11.1111Q158.799 11.5193 158.948 11.9353Q159.097 12.3513 159.225 
  12.7742Q159.353 13.197 159.461 13.6256Q159.568 14.0542 159.654 14.4876Q159.74 
  14.9209 159.805 15.358Q159.87 15.7951 159.913 16.2348Q159.957 16.6745 159.978 
  17.1158Q160 17.5571 160 17.999L160 398.001Q160 398.443 159.978 398.884Q159.957 
  399.326 159.913 399.765Q159.87 400.205 159.805 400.642Q159.74 401.079 159.654 
  401.512Q159.568 401.946 159.461 402.374Q159.353 402.803 159.225 403.226Q159.097 
  403.649 158.948 404.065Q158.799 404.481 158.63 404.889Q158.461 405.297 158.272 
  405.696Q158.083 406.096 157.875 406.486Q157.666 406.875 157.439 407.254Q157.212 
  407.633 156.967 408.001Q156.721 408.368 156.458 408.723Q156.195 409.078 155.914 
  409.419Q155.634 409.761 155.337 410.088Q155.041 410.416 154.728 410.728Q154.416 
  411.041 154.088 411.337Q153.761 411.634 153.419 411.914Q153.078 412.195 152.723 
  412.458Q152.368 412.721 152.001 412.967Q151.633 413.212 151.254 413.439Q150.875 
  413.666 150.486 413.875Q150.096 414.083 149.697 414.272Q149.297 414.461 148.889 
  414.63Q148.481 414.799 148.065 414.948Q147.649 415.097 147.226 415.225Q146.803 
  415.353 146.374 415.461Q145.946 415.568 145.512 415.654Q145.079 415.74 144.642 
  415.805Q144.205 415.87 143.765 415.913Q143.325 415.957 142.884 415.978Q142.443 416
  142.001 416L0 416L0 0Z" transform="translate(176 48)"  fill="none" fill-rule="evenodd" 
  class="${strokeClass}" stroke-width="32" />
  <path d="M0 0L126.001 0Q126.443 0 126.884 0.0216806Q127.325 0.0433612 127.765 
  0.0866701Q128.205 0.129979 128.642 0.194812Q129.079 0.259645 129.512 
  0.345846Q129.946 0.432047 130.374 0.539407Q130.803 0.646768 131.226 
  0.775031Q131.649 0.903293 132.065 1.05215Q132.481 1.201 132.889 1.37009Q133.297 
  1.53918 133.697 1.7281Q134.096 1.91701 134.486 2.1253Q134.875 2.33359 135.254 
  2.56074Q135.633 2.7879 136.001 3.03338Q136.368 3.27886 136.723 3.54207Q137.078 
  3.80528 137.419 4.08558Q137.761 4.36589 138.088 4.66262Q138.416 4.95935 138.728 
  5.27178Q139.041 5.58422 139.337 5.91161Q139.634 6.239 139.914 6.58055Q140.195 
  6.92211 140.458 7.27701Q140.721 7.63191 140.967 7.99929Q141.212 8.36668 141.439 
  8.74566Q141.666 9.12465 141.875 9.51433Q142.083 9.90401 142.272 10.3034Q142.461 
  10.7029 142.63 11.1111Q142.799 11.5193 142.948 11.9353Q143.097 12.3513 143.225 
  12.7742Q143.353 13.197 143.461 13.6256Q143.568 14.0542 143.654 14.4876Q143.74 
  14.9209 143.805 15.358Q143.87 15.7951 143.913 16.2348Q143.957 16.6745 143.978 
  17.1158Q144 17.5571 144 17.999L144 246.001Q144 246.443 143.978 246.884Q143.957 
  247.326 143.913 247.765Q143.87 248.205 143.805 248.642Q143.74 249.079 143.654 
  249.512Q143.568 249.946 143.461 250.374Q143.353 250.803 143.225 251.226Q143.097 
  251.649 142.948 252.065Q142.799 252.481 142.63 252.889Q142.461 253.297 142.272 
  253.697Q142.083 254.096 141.875 254.486Q141.666 254.875 141.439 255.254Q141.212 
  255.633 140.967 256.001Q140.721 256.368 140.458 256.723Q140.195 257.078 139.914 
  257.419Q139.634 257.761 139.337 258.088Q139.041 258.416 138.728 258.728Q138.416 
  259.041 138.088 259.337Q137.761 259.634 137.419 259.914Q137.078 260.195 136.723 
  260.458Q136.368 260.721 136.001 260.967Q135.633 261.212 135.254 261.439Q134.875 
  261.666 134.486 261.875Q134.096 262.083 133.697 262.272Q133.297 262.461 132.889 
  262.63Q132.481 262.799 132.065 262.948Q131.649 263.097 131.226 263.225Q130.803 
  263.353 130.374 263.461Q129.946 263.568 129.512 263.654Q129.079 263.74 128.642 
  263.805Q128.205 263.87 127.765 263.913Q127.325 263.957 126.884 263.978Q126.443 264
  126.001 264L17.999 264Q17.5571 264 17.1158 263.978Q16.6745 263.957 16.2348 
  263.913Q15.7951 263.87 15.358 263.805Q14.9209 263.74 14.4876 263.654Q14.0542 
  263.568 13.6256 263.461Q13.197 263.353 12.7742 263.225Q12.3513 263.097 11.9353 
  262.948Q11.5193 262.799 11.1111 262.63Q10.7029 262.461 10.3034 262.272Q9.90401 
  262.083 9.51433 261.875Q9.12465 261.666 8.74567 261.439Q8.36668 261.212 7.99929 
  260.967Q7.63191 260.721 7.27701 260.458Q6.92211 260.195 6.58056 259.914Q6.239 
  259.634 5.91161 259.337Q5.58422 259.041 5.27178 258.728Q4.95935 258.416 4.66262 
  258.088Q4.36589 257.761 4.08558 257.419Q3.80528 257.078 3.54207 256.723Q3.27886 
  256.368 3.03338 256.001Q2.7879 255.633 2.56074 255.254Q2.33359 254.875 2.1253 
  254.486Q1.91701 254.096 1.7281 253.697Q1.53918 253.297 1.37009 252.889Q1.201 
  252.481 1.05215 252.065Q0.903293 251.649 0.775031 251.226Q0.646768 250.803 
  0.539407 250.374Q0.432047 249.946 0.345846 249.512Q0.259645 249.079 0.194812 
  248.642Q0.129979 248.205 0.0866701 247.765Q0.0433612 247.326 0.0216806 246.884Q0 
  246.443 0 246.001L0 0Z" transform="translate(336 48)" fill="none" fill-rule="evenodd" 
  class="${strokeClass}" stroke-width="32" />
</svg>`);