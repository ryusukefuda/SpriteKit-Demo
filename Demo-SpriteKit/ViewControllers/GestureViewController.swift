//
//  GestureViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class GestureViewController: BaseViewController, UIGestureRecognizerDelegate {

    var panPointReference: CGPoint?
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func touchesBegan(touches: Set<NSObject>, withEvent event: UIEvent) {
        /* Called when a touch begins */
        for touch: AnyObject in touches {
            let location = touch.locationInView(self.view)
            scene.tapCircle(CGPointMake(location.x, self.view.bounds.height - location.y))
        }
    }

    @IBAction func didPan(sender: AnyObject) {
        let currentPoint = sender.translationInView(self.view)
        let location = sender.locationInView(self.view)
        if let originalPoint = panPointReference {
            scene.tapCircle(CGPointMake(location.x, self.view.bounds.height - location.y))
        } else if sender.state == UIGestureRecognizerState.Began {
            panPointReference = currentPoint
        }
        if sender.state == .Ended {
            panPointReference = nil
        }
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
