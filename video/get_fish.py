import cv2
import numpy as np
import img2log as i2l
import time
import flow

vid = cv2.VideoCapture('fish_360.mp4')

ret, frame = vid.read()
flow.init(frame)


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

      hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
      mask2 = cv2.inRange(hsv,(0, 100, 20), (25, 255, 255) )
      # mask = cv2.inRange(hsv,(10, 100, 20), (25, 255, 255) )
##      cv2.imshow("orange", mask2)
      cv2.imshow('Raw Video', frame)
      oflow = flow.doFlow(frame)
      gray_oflow = cv2.cvtColor(oflow, cv2.COLOR_BGR2GRAY)
      ret, oflow_mask = cv2.threshold(gray_oflow, 0, 128, cv2.THRESH_BINARY)
##      cv2.imshow('flow', oflow_mask)

      oColor = oflow_mask & mask2
      cv2.imshow('orange and flow', oColor)


      gray = cv2.cvtColor(cimg, cv2.COLOR_BGR2GRAY)
      norm = np.zeros((xs, ys))
      final = cv2.normalize(gray, norm, 0, 255, norm_type=cv2.NORM_MINMAX)
      sobelx = cv2.Sobel(src=final, ddepth=cv2.CV_64F, dx=1, dy=0, ksize=5)
      ret, thresh = cv2.threshold(final, 0, 128, cv2.THRESH_BINARY)
  



      ###mask = sobelx
      mask = oColor
      kernel    = np.ones((5,5), np.uint8)
      #mask = cv2.dilate(mask,kernel, iterations=1)
      mask = cv2.erode(mask,kernel, iterations=1)
      mask = cv2.erode(mask,kernel, iterations=1)
      mask = cv2.erode(mask,kernel, iterations=1)
      mask = cv2.erode(mask,kernel, iterations=1)


      small = cv2.resize(mask, (32,32))
      small_large = cv2.resize(small, (320,320))
      smalli = cv2.bitwise_not(small)
##      cv2.imshow('Video Capture Raw', mask)
      cv2.imshow('Small Large Img', small_large)

##      cv2.imshow('Small Image', small)
      i2l.img2log(smalli)
      if cv2.waitKey(30) & 0xff == ord('q'):
          break
