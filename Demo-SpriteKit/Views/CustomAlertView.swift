//
//  CustomAlertView.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class CustomAlertView: UIView {

    /*
    // Only override drawRect: if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func drawRect(rect: CGRect) {
        // Drawing code
    }
    */
    
    override init(frame: CGRect) {
        super.init(frame:frame)
        
        let customAlertView:UIView = UINib(nibName: "CustomAlertView", bundle: nil).instantiateWithOwner(self, options: nil)[0] as UIView
        customAlertView.frame = frame
        
        self.addSubview(customAlertView)
        println(NSString(format: "%p", self))
    }
    
    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        println(NSString(format: "%p", self))
        
    }

    @IBAction func tapCloseButton(sender: AnyObject) {
        UIView.animateWithDuration(0.5, animations: { () -> Void in
            self.alpha = 0.0;
            }) { (finished) -> Void in
                self.removeFromSuperview()
        }
    }
    
}
