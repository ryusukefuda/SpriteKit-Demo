//
//  BaseViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit
import SpriteKit

extension SKNode {
    class func unarchiveFromFile(file : NSString) -> SKNode? {
        if let path = NSBundle.mainBundle().pathForResource(file as String, ofType: "sks") {
            var sceneData = NSData(contentsOfFile: path, options: .DataReadingMappedIfSafe, error: nil)!
            var archiver = NSKeyedUnarchiver(forReadingWithData: sceneData)
            
            archiver.setClass(self.classForKeyedUnarchiver(), forClassName: "SKScene")
            let scene = archiver.decodeObjectForKey(NSKeyedArchiveRootObjectKey) as! UIScene
            archiver.finishDecoding()
            return scene
        } else {
            return nil
        }
    }
}

class BaseViewController: UIViewController {

    let centerX = UIScreen.mainScreen().bounds.width/2
    let centerY = UIScreen.mainScreen().bounds.height/2
    
    var skView:SKView!
    let scene = UIScene.unarchiveFromFile("UIScene") as! UIScene!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if (scene != nil)  {
            
            scene.size = CGSizeMake(self.view.bounds.width, self.view.bounds.height)
            scene.backgroundColor = UIColor.clearColor()
            
            // Configure the view.
            skView = SKView(frame: self.view.bounds)
            
            skView.allowsTransparency = true
            skView.userInteractionEnabled = false
            skView.showsFPS = false
            skView.showsNodeCount = false
            
            /* Sprite Kit applies additional optimizations to improve rendering performance */
            skView.ignoresSiblingOrder = true
            
            /* Set the scale mode to scale to fit the window */
            scene!.scaleMode = .AspectFill
            skView.presentScene(scene)
            
            self.view.addSubview(skView)
        }

    }
}
