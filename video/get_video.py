import cv2

vid = cv2.VideoCapture(0)

while(True):
      ret, frame = vid.read()
      s = frame.shape
      print(s)
      cimg = None
      xstart = None
      ystart = None
      xend   = None
      yend   = None

      if (s[0] < s[1]):
          xstart = 0
          xend   = s[0]
          ystart = 0
          yend   = s[0]
      else:
          xstart = 0
          xend   = s[1]
          ystart = 0
          yend   = s[1]
      cimg = frame[xstart:xend, ystart:yend]
      cv2.imshow('Video Capture Raw', cimg)
      if cv2.waitKey(1) & 0xff == ord('q'):
          break
