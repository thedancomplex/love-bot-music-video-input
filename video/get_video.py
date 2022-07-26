import cv2

vid = cv2.VideoCapture(0)

while(True):
      ret, frame = vid.read()
      s = frame.shape
      cimg = None
      xstart = None
      ystart = None
      xend   = None
      yend   = None

      if (s[0] < s[1]):
          dxy  = s[1] - s[0]
          ddxy = int(dxy/2)
          xstart = 0    
          xend   = s[0] 
          ystart = 0    + ddxy
          yend   = s[0] + ddxy
      else:
          dxy  = s[0] - s[1]
          ddxy = int(dxy/2)
          xstart = 0    + ddxy
          xend   = s[1] + ddxy
          ystart = 0 
          yend   = s[1]
      cimg = frame[xstart:xend, ystart:yend]
      s = cimg.shape
      print(s)
      cv2.imshow('Video Capture Raw', cimg)
      if cv2.waitKey(1) & 0xff == ord('q'):
          break
