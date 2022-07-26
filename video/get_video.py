import cv2
import numpy as np

vid = cv2.VideoCapture(0)

while(True):
      ret, frame = vid.read()
      s = frame.shape
      cimg = None
      xstart = None
      ystart = None
      xend   = None
      yend   = None
      xs     = None
      yx     = None
      if (s[0] < s[1]):
          xs   = s[0]
          ys   = s[0]
          dxy  = s[1] - s[0]
          ddxy = int(dxy/2)
          xstart = 0    
          xend   = s[0] 
          ystart = 0    + ddxy
          yend   = s[0] + ddxy
      else:
          xs   = s[1]
          ys   = s[1]
          dxy  = s[0] - s[1]
          ddxy = int(dxy/2)
          xstart = 0    + ddxy
          xend   = s[1] + ddxy
          ystart = 0 
          yend   = s[1]
      cimg = frame[xstart:xend, ystart:yend]
      s = cimg.shape
      print(s)
      gray = cv2.cvtColor(cimg, cv2.COLOR_BGR2GRAY)
      norm = np.zeros((xs, ys))
      final = cv2.normalize(gray, norm, 0, 255, norm_type=cv2.NORM_MINMAX)
      sobelx = cv2.Sobel(src=final, ddepth=cv2.CV_64F, dx=1, dy=0, ksize=5)
      ret, thresh = cv2.threshold(final, 0, 128, cv2.THRESH_BINARY)
      small = cv2.resize(sobelx, (16,16))
      cv2.imshow('Video Capture Raw', sobelx)
      cv2.imshow('Small Image', small)
      if cv2.waitKey(1) & 0xff == ord('q'):
          break
