//
//  MangaViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class MangaViewController: BaseViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        
        self.view.bringSubviewToFront(skView)
        let timer = NSTimer.scheduledTimerWithTimeInterval(1.5, target: self, selector: "update:", userInfo: nil, repeats: true)
        
    }
    
    func update(sender:AnyObject) {
        scene.manga()
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
