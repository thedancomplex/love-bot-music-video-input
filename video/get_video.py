import cv2

vid = cv2.VideoCapture(0)

while(True):
      ret, frame = vid.read()
      s = frame.shape
      print(s)
      cimg = None
      xr = None
      yr = None
      if (s[0] < s[1]):
          xr = range(s[0])
          yr = range(s[0])
      else:
          xr = range(s[1])
          yr = range(s[1])
      cimg = frame[xr, yr]
      cv2.imshow('Video Capture Raw', cimg)
      if cv2.waitKey(1) & 0xff == ord('q'):
          break
