import React from "react";

type SVGProps = { fillClass: string; strokeClass: string };

// https://transform.tools/css-to-js

export function BlankFile({ strokeClass }: SVGProps) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M416,221.25V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V96a48,48,0,0,1,48-48h98.75a32,32,0,0,1,22.62,9.37L406.63,198.63A32,32,0,0,1,416,221.25Z"
        className={strokeClass}
        style={{ fill: "none", strokeLinejoin: "round", strokeWidth: "32px" }}
      />
      <path
        d="M256,56V176a32,32,0,0,0,32,32H408"
        className={strokeClass}
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
      />
    </svg>
  );
}

export function ClosedFolder({ fillClass }: SVGProps) {
  return (
    <svg
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      version="1.1"
    >
      <defs>
        <path d="M0 0L512 0L512 512L0 512L0 0Z" id="path_1" />
        <clipPath id="mask_1">
          <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#path_1" />
        </clipPath>
      </defs>
      <g id="folder-open-outline-svgrepo-com-Copy">
        <path
          d="M0 128L0 56C0 40.536 5.46734 27.3367 16.402 16.402C27.3367 5.46734 40.536 -3.8147e-06 56 7.62939e-06L131.89 0C143.195 0.000282288 153.551 3.13628 162.956 9.408L190.795 27.9672C194.827 30.6556 199.265 31.9999 204.11 32L360 32C375.464 32 388.663 37.4674 399.598 48.402C410.533 59.3367 416 72.536 416 88L416 128C416 132.418 414.438 136.189 411.314 139.314C408.19 142.438 404.418 144 400 144C395.582 144 391.81 142.438 388.686 139.314C385.562 136.189 384 132.418 384 128L384 88C384 81.3726 381.657 75.7157 376.971 71.0294C372.284 66.3431 366.627 64 360 64L204.11 64C192.805 63.9997 182.45 60.864 173.045 54.5928L145.204 36.032C141.173 33.3441 136.735 32.0001 131.89 32L56 32C49.3726 32 43.7157 34.3431 39.0294 39.0294C34.3431 43.7157 32 49.3726 32 56L32 128C32 132.418 30.4379 136.189 27.3137 139.314C24.1895 142.438 20.4183 144 16 144C11.5817 144 7.81048 142.438 4.68629 139.314C1.56209 136.189 -3.8147e-06 132.418 0 128L0 128Z"
          className={fillClass}
          transform="translate(48 96)"
          id="Vector"
          fill-rule="evenodd"
          stroke="none"
        />
        <path
          xmlns="http://www.w3.org/2000/svg"
          d="M32 2.89864e-06Q21.4764 3.04896 13.1421 11.3833Q0 24.5254 0 43.1111L0 241.371C0 253.762 4.3807 264.338 13.1421 273.099C21.9035 281.86 32.4795 286.241 44.87 286.241L371.13 286.241C383.521 286.241 394.096 281.86 402.858 273.099C411.619 264.338 416 253.762 416 241.371L416 43.1111Q416 24.5254 402.858 11.3833C397.302 5.82706 391.016 2.03264 384 4.83332e-06L384 241.371C384 244.925 382.743 247.959 380.23 250.472C377.717 252.985 374.684 254.241 371.13 254.241L44.87 254.241C41.316 254.241 38.2826 252.985 35.7695 250.472C33.2565 247.959 32 244.925 32 241.371L32 2.89864e-06Z"
          className={fillClass}
          transform="translate(48 161.75885)"
          id="Vector-Difference"
          fill-rule="evenodd"
          stroke="none"
        />
        <path
          d="M0 0L512 0L512 512L0 512L0 0Z"
          id="Background"
          fill="none"
          fill-rule="evenodd"
          stroke="none"
        />
      </g>
    </svg>
  );
}

export function OpenedFolder({ strokeClass }: SVGProps) {
  return (
    <svg
      viewBox="0 0 544 544"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path d="M0 0L512 0L512 512L0 512L0 0Z" id="path_1" />
        <clipPath id="mask_1">
          <use xlinkHref="#path_1" />
        </clipPath>
      </defs>
      <g id="folder-open-outline-svgrepo-com" transform="translate(16 16)">
        <path
          d="M0 0L512 0L512 512L0 512L0 0Z"
          id="Background"
          fill="none"
          fill-rule="evenodd"
          stroke="none"
        />
        <g clip-path="url(#mask_1)">
          <path
            d="M0 112L0 40C0 17.9086 17.9086 0 40 0L115.89 0C123.788 0.000198364 131.509 2.33844 138.08 6.72L165.92 25.28C172.491 29.6616 180.212 31.9998 188.11 32L344 32C366.091 32 384 49.9086 384 72L384 112"
            className={strokeClass}
            transform="translate(64 80)"
            id="Shape"
            fill="none"
            fill-rule="evenodd"
            stroke-width="32"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M447.902 34.55L431.682 200C431.682 222.064 413.816 239.961 391.752 240L56.2519 240C34.1878 239.961 16.3218 222.064 16.3219 200L0.101862 34.55C-0.609785 25.648 2.43088 16.8536 8.48899 10.2922C14.5471 3.73085 23.0714 -0.000488281 32.0019 0L416.102 0C425.015 0.027359 433.513 3.77081 439.549 10.3289C445.585 16.8869 448.612 25.6653 447.902 34.55L447.902 34.55Z"
            className={strokeClass}
            transform="translate(31.998047 192)"
            id="Shape"
            fill="none"
            fill-rule="evenodd"
            stroke-width="32"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}
