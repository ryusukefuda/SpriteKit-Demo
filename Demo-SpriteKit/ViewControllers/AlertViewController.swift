//
//  AlertViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class AlertViewController: BaseViewController {
    
    let alertView = UIView()
    let alertBgView = UIView()
    
    override func viewDidLoad() {
        super.viewDidLoad()

    }
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        self.view.bringSubviewToFront(skView)
    }
    
    func showInfoAlert(){
        let width = self.view.bounds.width - 25
        let height = self.view.bounds.height - 300
        let infoAlertView = CustomAlertView(frame: CGRectMake(5, 44, width, height))
        infoAlertView.alpha = 0
        self.view.addSubview(infoAlertView)
        UIView.animateWithDuration(0.5, delay: 0, options: nil, animations: { () -> Void in
            infoAlertView.alpha = 1.0
        }, completion: nil)
        
    }
    
    func showAlertFromTop(){
        self.scene.doneAlert("YellowSpark", posi: CGPointMake(centerX, self.view.bounds.height - 64), delay: 0.1) { () -> Void in
            
        }
        
        let width = CGFloat(300)
        let left = (self.view.bounds.width - width) / 2
        alertBgView.frame = self.view.frame
        let closeButton = UIButton(frame: CGRectMake(100, 200, 100, 50))
        closeButton.backgroundColor = UIColor.whiteColor()
        closeButton.addTarget(self, action: "alertClose:", forControlEvents: UIControlEvents.TouchUpInside)
        closeButton.setTitleColor(UIColor(red:0.09, green:0.49, blue:0.98, alpha:1), forState: .Normal)
        closeButton.setTitle("閉じる", forState: UIControlState.Normal)
        let titleLabel = UILabel(frame: CGRectMake(65, 40, 200, 50))
        titleLabel.textColor = UIColor(red:0.09, green:0.49, blue:0.98, alpha:1)
        titleLabel.font = UIFont(name: "HiraKakuProN-W6", size: 25)
        titleLabel.text = "達成おめでとう！"
        let descriptionLabel = UILabel(frame: CGRectMake(65, 100, 200, 50))
        descriptionLabel.textColor = UIColor.grayColor()
        descriptionLabel.font = UIFont(name: "HiraKakuProN-W6", size: 18)
        descriptionLabel.text = "ちゃんとお返ししよう。"
        alertBgView.backgroundColor = UIColor.whiteColor()
        alertView.frame = CGRectMake(left, -width, width, 400)
        alertView.backgroundColor = UIColor(red:1, green:0.86, blue:0.37, alpha:1)
        alertView.addSubview(closeButton)
        alertView.addSubview(titleLabel)
        alertView.addSubview(descriptionLabel)
        self.view.addSubview(alertBgView)
        self.view.addSubview(alertView)
        UIView.animateWithDuration(0.5, animations: { () -> Void in
            self.alertBgView.alpha = 0.0
            self.alertView.frame = CGRectMake(left, 200, width, width)
            }) { (animated) -> Void in
        }
    }

    func alertClose(sender:AnyObject){
        self.alertView.removeFromSuperview()
        self.alertBgView.removeFromSuperview()
    }

    @IBAction func tapInformationButton(sender: AnyObject) {
        scene.infoAlert(CGPointMake(centerX, 100), delay: 1.0) { () -> Void in
            self.showInfoAlert()
        }
    }
    
    @IBAction func tapDoneButton(sender: AnyObject) {
        showAlertFromTop()
    }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
