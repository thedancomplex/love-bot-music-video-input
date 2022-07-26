import numpy as np
import cv2
import os
# reads image 'opencv-logo.png' as grayscale
img       = cv2.imread('djap.png.cropped.color')
gray      = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
img       = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
hsv       = img
#hsv       = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)


#print(np.max(img))
#lower =(100, 0,0)
#upper=(150, 255, 255)

h = 44
s = 80
v = 245
d = 20

lower = np.array([h-d, s-d, v-d])
upper = np.array([h+d, s+d, v+d])

mask      = cv2.inRange(hsv, lower, upper)
kernel    = np.ones((5,5), np.uint8)
mask = cv2.dilate(mask,kernel, iterations=1)
mask = cv2.erode(mask,kernel, iterations=1)
mask = cv2.erode(mask,kernel, iterations=1)

ret, thresh  = cv2.threshold(gray,170,255,cv2.THRESH_BINARY)
the_out = thresh + mask 
#the_out = mask
#the_out = thresh
#print(type(the_out))
#print(type(ret))
#print(type(gray))
cv2.imwrite('djap.png.cropped.png',the_out)
os.system('mv djap.png.cropped.png djap.png.cropped')
