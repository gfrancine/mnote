import { toHtml } from "../../mnote-util/dom";

export const markdownIcon = (fillClass: string, _strokeClass: string) =>
  toHtml(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" version="1.1">
  <path d="M156.001 0L19.999 0Q19.5081 0 19.0177 0.0240897Q18.5273 0.0481793 18.0388 0.0963006Q17.5502 0.144422 17.0645 0.216459Q16.5789
    0.288496 16.0974 0.384275Q15.6159 0.480054 15.1396 0.599345Q14.6634 0.718635 14.1936 0.86115Q13.7238 1.00366 13.2615 1.16906Q12.7993
    1.33446 12.3457 1.52233Q11.8921 1.71021 11.4483 1.92012Q11.0045 2.13003 10.5715 2.36146Q10.1386 2.59289 9.71746 2.84529Q9.29636 3.09768
    8.88815 3.37044Q8.47994 3.64319 8.08561 3.93565Q7.69128 4.22811 7.31177 4.53956Q6.93226 4.85102 6.56849 5.18072Q6.20472 5.51042 5.85757
    5.85757Q5.51042 6.20472 5.18072 6.56849Q4.85102 6.93226 4.53956 7.31177Q4.22811 7.69128 3.93565 8.08561Q3.64319 8.47994 3.37044 8.88815Q3.09768
    9.29636 2.84529 9.71746Q2.59289 10.1386 2.36146 10.5715Q2.13003 11.0045 1.92012 11.4483Q1.71021 11.8921 1.52233 12.3457Q1.33446 12.7993
    1.16906 13.2615Q1.00366 13.7238 0.86115 14.1936Q0.718635 14.6634 0.599345 15.1396Q0.480054 15.6159 0.384275 16.0974Q0.288496 16.5789
    0.216459 17.0645Q0.144422 17.5502 0.0963006 18.0388Q0.0481793 18.5273 0.0240897 19.0177Q0 19.5081 0 19.999L0 108.001Q0 108.492 0.0240897
    108.982Q0.0481793 109.473 0.0963006 109.961Q0.144422 110.45 0.216459 110.935Q0.288496 111.421 0.384275 111.903Q0.480054 112.384 0.599345
    112.86Q0.718635 113.337 0.86115 113.806Q1.00366 114.276 1.16906 114.738Q1.33446 115.201 1.52233 115.654Q1.71021 116.108 1.92012 116.552Q2.13003
    116.995 2.36146 117.428Q2.59289 117.861 2.84529 118.283Q3.09768 118.704 3.37044 119.112Q3.64319 119.52 3.93565 119.914Q4.22811 120.309 4.53956
    120.688Q4.85102 121.068 5.18072 121.431Q5.51042 121.795 5.85757 122.142Q6.20472 122.49 6.56849 122.819Q6.93226 123.149 7.31177 123.46Q7.69128
    123.772 8.08561 124.064Q8.47994 124.357 8.88815 124.63Q9.29636 124.902 9.71746 125.155Q10.1386 125.407 10.5715 125.639Q11.0045 125.87 11.4483
    126.08Q11.8921 126.29 12.3457 126.478Q12.7993 126.666 13.2615 126.831Q13.7238 126.996 14.1936 127.139Q14.6634 127.281 15.1396 127.401Q15.6159
    127.52 16.0974 127.616Q16.5789 127.711 17.0645 127.784Q17.5502 127.856 18.0388 127.904Q18.5273 127.952 19.0177 127.976Q19.5081 128 19.999
    128L156.001 128Q156.492 128 156.982 127.976Q157.473 127.952 157.961 127.904Q158.45 127.856 158.935 127.784Q159.421 127.711 159.903
    127.616Q160.384 127.52 160.86 127.401Q161.337 127.281 161.806 127.139Q162.276 126.996 162.738 126.831Q163.201 126.666 163.654 126.478Q164.108
    126.29 164.552 126.08Q164.995 125.87 165.428 125.639Q165.861 125.407 166.283 125.155Q166.704 124.902 167.112 124.63Q167.52 124.357 167.914
    124.064Q168.309 123.772 168.688 123.46Q169.068 123.149 169.432 122.819Q169.795 122.49 170.142 122.142Q170.49 121.795 170.819 121.431Q171.149
    121.068 171.46 120.688Q171.772 120.309 172.064 119.914Q172.357 119.52 172.63 119.112Q172.902 118.704 173.155 118.283Q173.407 117.861 173.639
    117.428Q173.87 116.995 174.08 116.552Q174.29 116.108 174.478 115.654Q174.666 115.201 174.831 114.738Q174.996 114.276 175.139 113.806Q175.281
    113.337 175.401 112.86Q175.52 112.384 175.616 111.903Q175.711 111.421 175.784 110.935Q175.856 110.45 175.904 109.961Q175.952 109.473 175.976
    108.982Q176 108.492 176 108.001L176 19.999Q176 19.5081 175.976 19.0177Q175.952 18.5273 175.904 18.0388Q175.856 17.5502 175.784 17.0645Q175.711
    16.5789 175.616 16.0974Q175.52 15.6159 175.401 15.1396Q175.281 14.6634 175.139 14.1936Q174.996 13.7238 174.831 13.2615Q174.666 12.7993 174.478
    12.3457Q174.29 11.8921 174.08 11.4483Q173.87 11.0045 173.639 10.5715Q173.407 10.1386 173.155 9.71746Q172.902 9.29636 172.63 8.88815Q172.357
    8.47994 172.064 8.08561Q171.772 7.69128 171.46 7.31177Q171.149 6.93226 170.819 6.56849Q170.49 6.20472 170.142 5.85757Q169.795 5.51042 169.432
    5.18072Q169.068 4.85102 168.688 4.53956Q168.309 4.22811 167.914 3.93565Q167.52 3.64319 167.112 3.37044Q166.704 3.09768 166.283 2.84529Q165.861
    2.59289 165.428 2.36146Q164.995 2.13003 164.552 1.92012Q164.108 1.71021 163.654 1.52233Q163.201 1.33446 162.738 1.16906Q162.276 1.00366 161.806
    0.86115Q161.337 0.718635 160.86 0.599345Q160.384 0.480054 159.903 0.384275Q159.421 0.288496 158.935 0.216459Q158.45 0.144422 157.961
    0.0963006Q157.473 0.0481793 156.982 0.0240897Q156.492 0 156.001 0ZM40 27.0001L40 27.0073L58.9965 48.2034L59.5 48.7652L60.0036 48.2034L79
    27.0074L79 27.0001L97 27.0001L97 99.0001L79 99.0001L79 53.9773L78.25 54.8141L60.0036 75.1732L59.5 75.7351L58.9964 75.1732L40.75 54.814L40
    53.9772L40 99.0001L22 99.0001L22 27.0001L40 27.0001ZM139 27.0001L139 75.0001L154 75.0001L130 99.0001L106 75.0001L121 75.0001L121 27.0001L139
    27.0001Z" transform="translate(8 32)" id="Rectangle-Copy-7-Difference" fill-rule="evenodd" stroke="none"
    class="${fillClass}"
  />
</svg>`);
