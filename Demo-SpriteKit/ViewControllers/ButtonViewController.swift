//
//  ButtonViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class ButtonViewController: BaseViewController {

    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    
    @IBAction func tapStartButton(sender: AnyObject) {
        let location = CGPointMake(sender.position.x, self.view.bounds.height - sender.position.y)
        scene.fireScaleSpark("BlueSpark", location: location, scale: CGFloat(2.5))
    }
    
    @IBAction func tapFavoriteButton(sender: AnyObject) {
        let location = CGPointMake(sender.position.x - 50, sender.position.y)
        scene.fireHeart(location)
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
