import cv2
import numpy as np
import img2log as i2l
import time
import random

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
      gray = cv2.cvtColor(cimg, cv2.COLOR_BGR2GRAY)
      norm = np.zeros((xs, ys))
      final = cv2.normalize(gray, norm, 0, 255, norm_type=cv2.NORM_MINMAX)
      sobelx = cv2.Sobel(src=final, ddepth=cv2.CV_64F, dx=1, dy=1, ksize=5)
      canny = cv2.Canny(final, 50, 50)
      ret, thresh = cv2.threshold(final, 0, 128, cv2.THRESH_BINARY)

      mask = sobelx
      mask = canny
      kernel    = np.ones((5,5), np.uint8)
      mask = cv2.dilate(mask,kernel, iterations=1)
      mask = cv2.erode(mask,kernel, iterations=1)
      mask = cv2.dilate(mask,kernel, iterations=1)
      mask = cv2.dilate(mask,kernel, iterations=1)


      small = cv2.resize(mask, (32,32))
      small_large = cv2.resize(small, (320,320))
      smalli = cv2.bitwise_not(small)

      xx = cv2.countNonZero(small)

      s = smalli.shape
      tt = s[0] * s[1]
      rat = float(xx) / float(tt)
      while( rat > 0.025 ):
        xi = random.randint(0,s[0]-1)
        yi = random.randint(0,s[1]-1)
        small[xi,yi] = 0
        xx = cv2.countNonZero(small)
        rat = float(xx) / float(tt)
      print(rat)
      cv2.imshow('Video Capture Raw', mask)
      cv2.imshow('Small Large Img', small_large)


      cv2.imshow('Small Image', small)
      smalli = cv2.bitwise_not(small)
      i2l.img2log(smalli)
      if cv2.waitKey(3000) & 0xff == ord('q'):
          break
