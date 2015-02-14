//
//  BlurViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/14.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class BlurViewController: BaseViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        skView.userInteractionEnabled = true
        scene.blur()
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
